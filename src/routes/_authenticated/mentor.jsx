import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import MentorModule from "@/mentor";

export const Route = createFileRoute("/_authenticated/mentor")({
  component: MentorPage,
});

function MentorPage() {
  return <MentorModule />;
}
