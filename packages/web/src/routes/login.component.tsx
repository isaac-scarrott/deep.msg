import { Button } from "@/components/ui/button";

function Login() {
  return (
    <form
      action={import.meta.env.VITE_AUTH_URL + "/authorize"}
      method="get"
      onSubmit={async (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        form.submit();
      }}
    >
      <input type="hidden" name="provider" value="google" />
      <input type="hidden" name="redirect_uri" value={location.origin + "/"} />
      <input type="hidden" name="response_type" value="token" />
      <input type="hidden" name="scope" value="openid email profile" />
      <input
        type="hidden"
        name="client_id"
        value={import.meta.env.VITE_GOOGLE_CLIENT_ID}
      />

      <Button type="submit">Login</Button>
    </form>
  );
}

export { Login as component };
