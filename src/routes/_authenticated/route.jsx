import React from "react";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    let user = null;

    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        user = data.user;
      }
    } catch {
      /* ignore Supabase auth check error */
    }

    if (!user && typeof window !== "undefined") {
      const token = localStorage.getItem("nexus_auth_token");
      const storedUser = localStorage.getItem("nexus_user");
      if (token) {
        try {
          const parsed = storedUser ? JSON.parse(storedUser) : null;
          user = parsed || { id: "demo_user", email: "elias.thorne@buildverse.io" };
        } catch {
          user = { id: "demo_user", email: "elias.thorne@buildverse.io" };
        }
      }
    }

    if (!user) {
      throw redirect({ to: "/login" });
    }

    return { user };
  },
  component: () => <Outlet />,
});
