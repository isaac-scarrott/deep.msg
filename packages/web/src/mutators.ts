import { WriteTransaction } from "replicache";

export type Message = {
  readonly id: string;
  readonly from: string;
  readonly content: string;
  readonly sort: number;
};

export type MessageUpdate = Partial<Message> & Pick<Message, "id">;

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
