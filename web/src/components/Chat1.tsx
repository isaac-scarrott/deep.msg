import { Fragment, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";

type ChatProps = {
  screenName: string | null;
};

function Chat({ screenName }: ChatProps) {
  const [messages, setMessages] = useState<string[]>([]);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <>
      <div className="flex flex-col gap-1">
        {messages.map((message, messageIndex) => (
          <Fragment key={messageIndex}>
            {messageIndex !== 0 ? <Separator /> : null}
            <div>{message}</div>
          </Fragment>
        ))}
      </div>

      <div className="flex gap-1">
        <Textarea placeholder="Type something..." ref={textAreaRef} />

        <Button
          onClick={() => {
            if (!screenName) {
              window.location.reload();

              return;
            }

            if (textAreaRef.current?.value) {
              setMessages([...messages, textAreaRef.current.value]);
              textAreaRef.current.value = "";
            }
          }}
        >
          Send
        </Button>
      </div>
    </>
  );
}

export { Chat };
