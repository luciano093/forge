import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@forge/auth";

import { HydrateClient } from "~/trpc/server";
import { SessionNavbar } from "../_components/navigation/session-navbar";
import { UserInterface } from "../_components/user-interface";

export const metadata: Metadata = {
  title: "Blade | Dashboard",
  description: "Manage your Knight Hacks account.",
};

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <HydrateClient>
      <SessionNavbar />
      <main className="container h-screen py-16">
        <UserInterface />
      </main>
    </HydrateClient>
  );
}
