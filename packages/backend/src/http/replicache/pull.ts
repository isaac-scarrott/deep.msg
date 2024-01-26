import { and, eq, gt } from "drizzle-orm";
import { PullResponse } from "replicache";
import {
  message,
  replicacheClient,
  replicacheServer,
} from "src/database/schema";
import { TxOrDb, createTransaction } from "src/database/transaction";
import { ApiHandler } from "sst/node/api";

const serverID = 1;

const handler = ApiHandler(async (event) => {
  const pull = JSON.parse(event.body ?? "{}");

  console.log(`Processing pull`, JSON.stringify(pull));

  const { clientGroupID } = pull;
  const fromVersion = pull.cookie ?? 0;
  const t0 = Date.now();

  try {
    // Read all data in a single transaction so it's consistent.
    return await createTransaction(async (tx) => {
      const [replicacheServerRow] = await tx
        .select({
          version: replicacheServer.version,
        })
        .from(replicacheServer)
        .where(eq(replicacheServer.id, serverID))
        .for("update")
        .execute();

      const currentVersion = replicacheServerRow?.version ?? 0;

      if (fromVersion > currentVersion) {
        throw new Error(
          `fromVersion ${fromVersion} is from the future - aborting. This can happen in development if the server restarts. In that case, clear appliation data in browser and refresh.`,
        );
      }

      const lastMutationIDChanges = await getLastMutationIDChanges(
        tx,
        clientGroupID,
        fromVersion,
      );

      const changed = await tx
        .select()
        .from(message)
        .where(
          and(gt(message.version, fromVersion), eq(message.deleted, false)),
        )
        .execute();

      const patch = [];

      for (const row of changed) {
        const { id, sender, content, sort, version: rowVersion, deleted } = row;
        if (deleted) {
          if (rowVersion > fromVersion) {
            patch.push({
              op: "del",
              key: `message/${id}`,
            } as const);
          }
        } else {
          patch.push({
            op: "put",
            key: `message/${id}`,
            value: {
              from: sender,
              content,
              sort,
            },
          } as const);
        }
      }

      console.log(JSON.stringify({ patch }, null, 2));

      const body: PullResponse = {
        lastMutationIDChanges: lastMutationIDChanges ?? {},
        cookie: currentVersion,
        patch,
      };

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      };
    });
  } catch (e) {
    console.error(e);

    if (e instanceof Error) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: e.message,
        }),
      };
    }

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Unknown error",
      }),
    };
  } finally {
    console.log("Processed pull in", Date.now() - t0);
  }
});

async function getLastMutationIDChanges(
  tx: TxOrDb,
  clientGroupID: string,
  fromVersion: number,
) {
  const rows = await tx
    .select()
    .from(replicacheClient)
    .where(
      and(
        eq(replicacheClient.clientGroupId, clientGroupID),
        gt(replicacheClient.lastMutationId, fromVersion),
      ),
    )
    .execute();
  return Object.fromEntries(rows.map((r) => [r.id, r.lastMutationId]));
}

export { handler };
