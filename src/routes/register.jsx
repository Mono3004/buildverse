import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/app/AuthForm";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — BuildVerse workspace" },
      {
        name: "description",
        content:
          "Create your account on BuildVerse workspace to access role-based dashboards, projects, and administration.",
      },
    ],
  }),
  component: () => <AuthForm mode="register" />,
});
