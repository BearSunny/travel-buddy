import { auth0 } from "@/lib/auth0";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import { redirect, RedirectType } from "next/navigation";

export default async function Home() {
  const session = await auth0.getSession();
  const user = session?.user;
  if (!user) {
    redirect('/auth/login', RedirectType.push)
  } else return <HomePage/>; // Authorized
}