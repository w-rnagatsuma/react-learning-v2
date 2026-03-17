import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useSession } from "@/api/session/useSession";
import { useUpdateProfile } from "@/hooks/api/useUpdateProfile";

export function ProfilePage() {
  const { isLoading } = useRequireAuth();
  const { user } = useSession();
  const updateProfile = useUpdateProfile();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p>{user?.name}</p>

      <Button
        onClick={() => {
          updateProfile.mutate({ displayName: "New Name" });
        }}
        disabled={updateProfile.isPending}
      >
        更新
      </Button>
    </div>
  );
}