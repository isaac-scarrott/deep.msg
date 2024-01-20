import { Outlet, RootRoute, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = new RootRoute({
  beforeLoad: async ({ location }) => {
    const accessToken = new URLSearchParams(
      window.location.hash.substring(1),
    ).get("access_token");

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search,
      );
    }

    if (
      !localStorage.getItem("accessToken") &&
      location.pathname !== "/login"
    ) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: () => (
    <>
      <Outlet />

      <TanStackRouterDevtools />
    </>
  ),
});
