import { auth0 } from "@/lib/auth0";
import LandingPage from "./pages/LandingPage";
import { redirect, RedirectType } from "next/navigation";
import { CollaborationProvider } from "@/context/CollaborationContext";
import HomePage from "./pages/HomePage";

export default async function Home() {
  const session = await auth0.getSession();
  const user = session?.user;
  if (!user) {
    redirect("/auth/login", RedirectType.push);
  } else
    return (
        <HomePage />
    ); // Authorized
}
