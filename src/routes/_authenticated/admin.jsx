import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import AdminModule from "@/admin";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  return <AdminModule />;
}
