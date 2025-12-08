import LogoutButton from "@/components/NavigationBar/LogoutButton";
import Profile from "@/components/NavigationBar/Profile";
import "@/app/styles/globals.css";

export default function NavigationBar() {
  return (
    <div className="w-full h-full border flex justify-between items-center px-2">
      <a href="/" className="font-logo text-3xl">
        TRAVELUS
      </a>

      <div className="flex items-center gap-4">
        <a href="/" className="text-xl">
          Home
        </a>
        <a href="/discover" className="text-xl">
          Discover
        </a>
        <a href="/faq" className="text-xl">
          FAQ
        </a>
        <Profile />
      </div>
    </div>
  );
}
