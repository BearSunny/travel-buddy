import { useDbUser } from "@/context/userContext";

export default function Profile() {
  const { user, isLoading } = useDbUser();

  if (isLoading) return <div>Loading user profile...</div>;
  if (!user) return null;

  const picture = user.avatar?.split("=")[0]; // removes forced size

  return (
    <div className="flex h-12px p-5 items-center gap-4">
      {picture && (
        <img
          src={picture}
          alt={user.display_name || "User profile"}
          className="h-10 rounded-full shrink-0"
        />
      )}
      <div>
        <h2 className="text-l font-semibold">{user.display_name}</h2>
        <p className="text-gray-500">{user.email}</p>
      </div>
    </div>
  );
}
