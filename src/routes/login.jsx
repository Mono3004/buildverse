import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/app/AuthForm";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — BuildVerse workspace" },
      {
        name: "description",
        content:
          "Sign in to your BuildVerse workspace to access role-based dashboards, projects, and administration.",
      },
    ],
  }),
  component: () => <AuthForm mode="login" />,
});
