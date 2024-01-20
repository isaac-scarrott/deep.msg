import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { Input } from "./ui/input";
import { Form } from "./ui/form";

type ScreenNameDialogProps = {
  screenName: string | null;
  setScreenName: (screenName: string) => void;
};

const screenNameFormSchema = z.object({
  screenName: z.string().min(1).max(20),
});

function ScreenNameDialog({
  screenName,
  setScreenName,
}: ScreenNameDialogProps) {
  const form = useForm<z.infer<typeof screenNameFormSchema>>({
    resolver: zodResolver(screenNameFormSchema),
    defaultValues: { screenName: "" },
  });

  function onSubmit(values: z.infer<typeof screenNameFormSchema>) {
    setScreenName(values.screenName);
  }

  return (
    <Dialog open={screenName === null}>
      <Dialog.Content showClose={false}>
        <Dialog.Header>
          <Dialog.Title>What's your name?</Dialog.Title>
        </Dialog.Header>

        <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
          <Form.Field
            control={form.control}
            name="screenName"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Screen Name</Form.Label>

                <Form.Control>
                  <Input {...field} />
                </Form.Control>

                <Form.Description>
                  This will be your screen name.
                </Form.Description>

                <Form.Message />
              </Form.Item>
            )}
          />

          <Dialog.Footer>
            <Button type="submit">Save</Button>
          </Dialog.Footer>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
}

export { ScreenNameDialog };
