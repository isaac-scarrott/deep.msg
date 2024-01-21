import { ApiHandler } from "sst/node/api";

const handler = ApiHandler(async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      lastMutationIDChanges: {},
      cookie: 42,
      patch: [
        { op: "clear" },
        {
          op: "put",
          key: "message/qpdgkvpb9ao",
          value: {
            id: 1,
            from: "Jane",
            content: "Hey, what's for lunch?",
            sort: 1,
          },
        },
        {
          op: "put",
          key: "message/5ahljadc408",
          value: {
            id: 2,
            from: "Fred",
            content: "tacos?",
            sort: 2,
          },
        },
      ],
    }),
  };
});

export { handler };
