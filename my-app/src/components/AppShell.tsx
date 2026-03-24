import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { BriefcaseBusiness, FileText, GitGraph, Home, Image, Menu, Settings2, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/api/session/useSession";

const baseNavItems = [
  { to: "/", label: "ホーム", icon: Home, end: true },
  { to: "/services", label: "サービス一覧", icon: BriefcaseBusiness, end: true },
  { to: "/session-management", label: "セッション管理", icon: Settings2, end: true },
] as const;

const profileNavItem = { to: "/profile", label: "プロフィール", icon: UserRound, end: false } as const;

function getSelectedServiceId(pathname: string) {
  const matched = pathname.match(/^\/services\/([^/]+)(?:\/.*)?$/);
  if (!matched) {
    return null;
  }

  try {
    return decodeURIComponent(matched[1]);
  } catch {
    return matched[1];
  }
}

export function AppShell() {
  const { user } = useSession();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.matchMedia("(min-width: 768px)").matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleChange = (event: MediaQueryListEvent) => {
      setIsSidebarOpen(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? "U";
  const selectedServiceId = getSelectedServiceId(location.pathname);
  const encodedServiceId = selectedServiceId ? encodeURIComponent(selectedServiceId) : null;

  const serviceNavItems = encodedServiceId
    ? [
        { to: `/services/${encodedServiceId}/test`, label: "テスト", icon: FileText, end: true },
        { to: `/services/${encodedServiceId}/image`, label: "イメージ", icon: Image, end: true },
        { to: `/services/${encodedServiceId}/flow-diagram`, label: "画面遷移図", icon: GitGraph, end: true },
      ]
    : [];

  const navItems = [...baseNavItems, ...serviceNavItems, profileNavItem];
  const dividerAfterPaths = new Set([
    "/",
    serviceNavItems.length > 0 ? serviceNavItems[serviceNavItems.length - 1].to : "/session-management",
  ]);

  return (
    <div className="relative flex min-h-svh flex-col text-left">
      <header className="sticky top-0 z-40 border-b bg-background/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={isSidebarOpen ? "メニューを閉じる" : "メニューを開く"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            >
              <Menu className="h-4 w-4" />
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-2 font-semibold text-foreground"
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
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-56 shrink-0 border-r bg-muted/95 p-4 pt-16 backdrop-blur transition-transform md:top-14 md:h-[calc(100svh-3.5rem)] md:overflow-y-auto md:bg-muted/30 md:pt-4 md:backdrop-blur-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <p className="mb-4 text-sm font-semibold text-muted-foreground">MENU</p>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.to}>
                <NavLink
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

                {dividerAfterPaths.has(item.to) ? (
                  <div aria-hidden="true" className="my-2 border-t border-border" />
                ) : null}
              </div>
            );
          })}
        </nav>
      </aside>

      <main
        className={cn(
          "min-w-0 flex-1 transition-[margin] duration-200",
          isSidebarOpen ? "md:ml-56" : "md:ml-0",
        )}
      >
        <Outlet />
      </main>
      </div>
    </div>
  );
}