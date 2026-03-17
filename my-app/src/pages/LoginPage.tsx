import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "@/api/session/useSession";
import { useLogin } from "@/hooks/api/useLogin";
import { getDevCredentials, isDevMode } from "@/api/session/devMockAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useSession();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const devCredentials = getDevCredentials();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await login.mutateAsync({ email, password });
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>メールアドレスとパスワードを入力してください</CardDescription>
          {isDevMode() ? (
            <p className="text-xs text-muted-foreground">
              開発用: {devCredentials.email} / {devCredentials.password}
            </p>
          ) : null}
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {login.error ? (
              <p className="text-sm text-destructive">ログインに失敗しました。入力内容を確認してください。</p>
            ) : null}

            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}