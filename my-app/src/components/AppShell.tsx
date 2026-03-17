import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Home, Menu, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/api/session/useSession";

const navItems = [
  { to: "/", label: "ホーム", icon: Home, end: true },
  { to: "/profile", label: "プロフィール", icon: UserRound, end: false },
] as const;

export function AppShell() {
  const { user } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <div className="relative flex min-h-svh flex-col text-left">
      <header className="sticky top-0 z-40 border-b bg-background/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="メニューを開く"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            >
              <Menu className="h-4 w-4" />
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-2 font-semibold text-foreground"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-primary text-xs text-primary-foreground">
                RL
              </span>
              <span>React Learn</span>
            </Link>
          </div>

          <Link
            to="/profile"
            aria-label="プロフィールへ移動"
            className="rounded-full transition-opacity hover:opacity-80"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Avatar size="sm">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
      {isSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          aria-label="メニューを閉じる"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-56 shrink-0 border-r bg-muted/95 p-4 pt-16 backdrop-blur transition-transform md:static md:z-0 md:translate-x-0 md:bg-muted/30 md:pt-4 md:backdrop-blur-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <p className="mb-4 text-sm font-semibold text-muted-foreground">MENU</p>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      </div>
    </div>
  );
}