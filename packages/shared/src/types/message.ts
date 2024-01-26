type Message = {
  readonly id: string;
  readonly from: string;
  readonly content: string;
  readonly sort: number;
};

type MessageUpdate = Partial<Message> & Pick<Message, "id">;

export type { Message, MessageUpdate };
