import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { AppWindow, BarChart3, BriefcaseBusiness, ChevronDown, FileText, GitGraph, Home, Image, Menu, Settings2, ShieldCheck, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/api/session/useSession";
import { useServices } from "@/hooks/api/useServices";

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
  const { data: servicesData } = useServices();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  const [isServiceSettingsOpen, setIsServiceSettingsOpen] = useState(true);
  const [isServiceInsightsOpen, setIsServiceInsightsOpen] = useState(true);

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
  const selectedServiceName = selectedServiceId
    ? servicesData?.services.find((service) => service.id === selectedServiceId)?.name
    : null;

  const serviceNavItems = encodedServiceId
    ? [
        { to: `/services/${encodedServiceId}/test`, label: "テスト", icon: FileText, end: true },
        { to: `/services/${encodedServiceId}/image`, label: "イメージ", icon: Image, end: true },
        { to: `/services/${encodedServiceId}/flow-diagram`, label: "画面遷移図", icon: GitGraph, end: true },
      ]
    : [];

  const navItems = [...baseNavItems, ...serviceNavItems];
  const firstServiceNavPath = serviceNavItems[0]?.to;
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
            const shouldShowServiceLabel = Boolean(firstServiceNavPath && item.to === firstServiceNavPath && selectedServiceId);
            const serviceLabel = selectedServiceName ?? selectedServiceId;

            return (
              <div key={item.to}>
                {shouldShowServiceLabel ? (
                  <div className="mb-2 flex items-center gap-2 rounded-md bg-black px-3 py-2 text-sm font-medium text-white">
                    <AppWindow className="h-4 w-4 shrink-0" />
                    <p className="truncate" title={serviceLabel ?? undefined}>{serviceLabel}</p>
                  </div>
                ) : null}

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

          <section className="my-3 rounded-md border border-border bg-background/80 p-3">
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground">管理者メニュー</p>

            <div className="space-y-2 text-sm">
              <div>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded px-1 py-1 text-left font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  aria-expanded={isServiceSettingsOpen}
                  onClick={() => setIsServiceSettingsOpen((prev) => !prev)}
                >
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">サービス設定</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isServiceSettingsOpen ? "rotate-180" : "rotate-0",
                    )}
                  />
                </button>

                {isServiceSettingsOpen ? (
                  <ul className="mt-1 space-y-1 pl-6 text-muted-foreground">
                    <li>アクセス管理</li>
                    <li>ログ管理</li>
                  </ul>
                ) : null}
              </div>

              <div>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded px-1 py-1 text-left font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  aria-expanded={isServiceInsightsOpen}
                  onClick={() => setIsServiceInsightsOpen((prev) => !prev)}
                >
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">サービスインサイト</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isServiceInsightsOpen ? "rotate-180" : "rotate-0",
                    )}
                  />
                </button>

                {isServiceInsightsOpen ? (
                  <ul className="mt-1 space-y-1 pl-6 text-muted-foreground">
                    <li>ストレージインサイト</li>
                  </ul>
                ) : null}
              </div>
            </div>
          </section>

          <NavLink
            to={profileNavItem.to}
            end={profileNavItem.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )
            }
          >
            <profileNavItem.icon className="h-4 w-4" />
            <span>{profileNavItem.label}</span>
          </NavLink>
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