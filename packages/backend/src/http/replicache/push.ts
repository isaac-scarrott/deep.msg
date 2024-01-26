import { eq } from "drizzle-orm";
import { type Message } from "@deepmsg/shared";
import { MutationV1 } from "replicache";
import {
  message,
  replicacheClient,
  replicacheServer,
} from "src/database/schema";
import { TxOrDb, createTransaction } from "src/database/transaction";
import { ApiHandler } from "sst/node/api";
import { randomUUID } from "crypto";

const serverId = 1;

async function getLastMutationID(tx: TxOrDb, clientID: string) {
  const [clientRow] = await tx
    .select({
      last_mutation_id: replicacheClient.lastMutationId,
    })
    .from(replicacheClient)
    .where(eq(replicacheClient.id, clientID))
    .execute();

  if (!clientRow) {
    return 0;
  }

  return clientRow.last_mutation_id;
}

const handler = ApiHandler(async (event) => {
  const push = JSON.parse(event.body ?? "{}");

  console.log("Processing push", JSON.stringify(push));

  const t0 = Date.now();

  try {
    for (const mutation of push.mutations) {
      const t1 = Date.now();

      try {
        await createTransaction((t) => {
          return processMutation(t, push.clientGroupID, mutation);
        });
      } catch (e) {
        console.error("Caught error from mutation", mutation, e);

        await createTransaction((t) =>
          processMutation(t, push.clientGroupID, mutation, e),
        );
      }

      console.log("Processed mutation in", Date.now() - t1);
    }

    // await sendPoke();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    };
  } catch (e) {
    console.error(e);

    if (e instanceof Error) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: e.message }),
      };
    }

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Unknown error" }),
    };
  } finally {
    console.log("Processed push in", Date.now() - t0);
  }
});

async function processMutation(
  tx: TxOrDb,
  clientGroupID: string,
  mutation: MutationV1,
  error?: unknown,
) {
  const { clientID: clientId } = mutation;

  const [replicacheServerRow] = await tx
    .select({
      version: replicacheServer.version,
    })
    .from(replicacheServer)
    .where(eq(replicacheServer.id, serverId))
    .for("update")
    .execute();

  const prevVersion = replicacheServerRow?.version ?? 0;
  const nextVersion = prevVersion + 1;

  const lastMutationID = await getLastMutationID(tx, clientId);
  const nextMutationID = lastMutationID + 1;

  console.log("nextVersion", nextVersion, "nextMutationID", nextMutationID);

  if (mutation.id < nextMutationID) {
    console.log(
      `Mutation ${mutation.id} has already been processed - skipping`,
    );

    return;
  }

  if (mutation.id > nextMutationID) {
    throw new Error(
      `Mutation ${mutation.id} is from the future - aborting. This can happen in development if the server restarts. In that case, clear appliation data in browser and refresh.`,
    );
  }

  if (error === undefined) {
    console.log("Processing mutation:", JSON.stringify(mutation));

    switch (mutation.name) {
      case "createMessage":
        await createMessage(tx, mutation.args as Message, nextVersion);
        break;
      default:
        throw new Error(`Unknown mutation: ${mutation.name}`);
    }
  } else {
    console.log(
      "Handling error from mutation",
      JSON.stringify(mutation),
      error,
    );
  }

  console.log("setting", clientId, "last_mutation_id to", nextMutationID);

  const updateReplicacheClient = await tx
    .update(replicacheClient)
    .set({
      clientGroupId: clientGroupID,
      lastMutationId: nextMutationID,
      version: nextVersion,
    })
    .where(eq(replicacheClient.id, clientId))
    .execute();

  if (updateReplicacheClient.rowsAffected === 0) {
    await tx
      .insert(replicacheClient)
      .values({
        id: clientId,
        clientGroupId: clientGroupID,
        lastMutationId: nextMutationID,
        version: nextVersion,
      })
      .execute();
  }

  await tx
    .update(replicacheServer)
    .set({ version: nextVersion })
    .where(eq(replicacheServer.id, serverId))
    .execute();
}

async function createMessage(
  tx: TxOrDb,
  { from, content, sort }: Message,
  version: number,
) {
  return await tx.insert(message).values({
    id: randomUUID(),
    sender: from,
    content,
    sort,
    deleted: false,
    version,
  });
}

export { handler };
