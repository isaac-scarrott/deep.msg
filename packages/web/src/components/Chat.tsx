import { Fragment } from "react";
import { useSubscribe } from "replicache-react";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "./ui/form";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { Send } from "lucide-react";
import { useReplicache } from "@/context/replicache";
import { type Message } from "@/mutators";

type ChatProps = {
  screenName: string | null;
};

const messageFormSchema = z.object({
  message: z.string().min(1).max(200),
});

function MessageComponent({ from, content }: Message) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <span className="font-bold">{from}</span>
        <span>{content}</span>
      </div>
    </div>
  );
}

function Chat({ screenName }: ChatProps) {
  const rep = useReplicache();
  const messages = useSubscribe(
    rep,
    async (tx) => {
      const list = await tx
        .scan<Message>({ prefix: "message/" })
        .entries()
        .toArray();

      list.sort(([, a], [, b]) => a.sort - b.sort);

      return list;
    },
    { default: [] },
  );

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: { message: "" },
    reValidateMode: "onSubmit",
  });

  function onSubmit(values: z.infer<typeof messageFormSchema>) {
    const last = messages.length ? messages[messages.length - 1][1] : null;
    const lastSort = last ? last.sort : 0;
    const sort = lastSort + 1;

    rep.mutate.createMessage({
      id: crypto.randomUUID(),
      from: screenName!,
      content: values.message,
      sort,
    });

    form.reset();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Not too sure how good this is, but it seems to work...
    const isMac = window.navigator.platform.toUpperCase().indexOf("MAC") >= 0;

    if (isMac && event.metaKey && event.key === "Enter") {
      form.handleSubmit(onSubmit)();
    } else if (!isMac && event.ctrlKey && event.key === "Enter") {
      form.handleSubmit(onSubmit)();
    }
  }

  return (
    <div className="h-screen text-white flex flex-col">
      <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {messages.map(([, message], messageIndex) => (
          <Fragment key={messageIndex}>
            <MessageComponent {...message} />
            <Separator />
          </Fragment>
        ))}
      </div>

      <Form
        {...form}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center"
      >
        <Form.Field
          control={form.control}
          name="message"
          render={({ field }) => (
            <Form.Item className="flex-1">
              <Form.Control>
                <Textarea
                  {...field}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter a message..."
                />
              </Form.Control>

              <Form.Message />
            </Form.Item>
          )}
        />

        <Button variant="ghost" disabled={!screenName} type="submit">
          <Send className="text-zinc-300" />
        </Button>
      </Form>
    </div>
  );
}

export { Chat };
