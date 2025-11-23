import { useUser } from "@auth0/nextjs-auth0";

export default function Profile() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div>Loading user profile...</div>;
  if (!user) return null;

  const picture = user.picture?.split("=")[0]; // removes forced size

  return (
    <div className="flex h-12px p-5 items-center gap-4">
      {picture && (
        <img
          src={picture}
          alt={user.name || "User profile"}
          className="h-12 rounded-full shrink-0"
        />
      )}
      <div>
        <h2 className="text-xl font-semibold">{user.name}</h2>
        <p className="text-gray-500">{user.email}</p>
      </div>
    </div>
  );
}
