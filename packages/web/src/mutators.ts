import { WriteTransaction } from "replicache";
import type { Message } from "@deepmsg/shared";

export type M = typeof mutators;

const mutators = {
  async createMessage(
    tx: WriteTransaction,
    { id, from, content, sort }: Message,
  ) {
    await tx.set(`message/${id}`, {
      from,
      content,
      sort,
    });
  },
};

export { mutators };
