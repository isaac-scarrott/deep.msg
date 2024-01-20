import { Fragment, useState } from "react";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "./ui/form";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { Send } from "lucide-react";

type ChatProps = {
  screenName: string | null;
};

type Message = {
  screenName: string;
  message: string;
};

const messageFormSchema = z.object({
  message: z.string().min(1).max(200),
});

function MessageComponent({ screenName, message }: Message) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <span className="font-bold">{screenName}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}

function Chat({ screenName }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: { message: "" },
    reValidateMode: "onSubmit",
  });

  function onSubmit(values: z.infer<typeof messageFormSchema>) {
    setMessages((messages) => [
      ...messages,
      { screenName: screenName!, message: values.message },
    ]);

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
        {messages.map((message, messageIndex) => (
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
