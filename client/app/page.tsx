import { auth0 } from "@/lib/auth0";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";

export default async function Home() {
  const session = await auth0.getSession();
  const user = session?.user;
  if (!user) {
    // Authorizing
    return <LandingPage />;
  } else return <HomePage/>; // Authorized
}
