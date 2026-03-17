import { useSession } from "@/api/session/useSession";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export function HomePage() {
  const { isLoading, isAuthenticated } = useRequireAuth();
  const { user } = useSession();

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-6 space-y-2">
      <h1 className="text-2xl font-bold">Home</h1>
      <p>ログイン済みです</p>
      <p>name: {user?.name}</p>
      <p>email: {user?.email}</p>
    </div>
  );
}