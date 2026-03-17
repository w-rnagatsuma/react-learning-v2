import { NavLink, Outlet } from "react-router-dom";
import { Home, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const navItems = [
  { to: "/", label: "ホーム", icon: Home, end: true },
  { to: "/profile", label: "プロフィール", icon: UserRound, end: false },
] as const;

export function AppShell() {
  return (
    <div className="flex min-h-svh text-left">
      <aside className="w-56 shrink-0 border-r bg-muted/30 p-4">
        <p className="mb-4 text-sm font-semibold text-muted-foreground">MENU</p>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
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
  );
}