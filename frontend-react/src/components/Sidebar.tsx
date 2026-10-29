import React from "react";
import { Home, Compass, User, FlameIcon, Search, Users, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { signOut } from "@/lib/auth";
import { Link, useNavigate } from "@tanstack/react-router";

type NavLink = {
  to: "/home" | "/discover" | "/connect/suggested-friends" | "/profile/$username";
  label: string;
  icon: React.ElementType;
};

const NAV: NavLink[] = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/connect/suggested-friends", label: "Make friends", icon: Users },
  { to: "/profile/$username", label: "Profile", icon: User },
];

const navItem = (Icon: React.ElementType, label: string) =>
  ({ isActive }: { isActive: boolean }) => (
    <>
      {isActive && (
        <span className="absolute inset-0 rounded-full bg-white/8" />
      )}
      <Icon
        className="relative z-10 h-5 w-5 shrink-0"
        strokeWidth={isActive ? 2.4 : 2}
      />
      <span className="relative z-10 hidden flex-1 truncate text-left lg:block">{label}</span>
    </>
  );

// icon-only (centered) on tablets, icon + label from lg up
const navClass =
  "group relative flex items-center justify-center gap-3 rounded-full px-4 py-2.5 text-[15px] font-semibold text-white/55 transition-colors hover:bg-white/5 hover:text-white lg:justify-start";

export default function Sidebar(): React.JSX.Element {
  const { user } = useAuthStore.getState();
  const navigate = useNavigate();

  return (
    <aside className="sticky top-0 z-20 hidden h-screen w-20 shrink-0 flex-col justify-between border-r border-line bg-ink/80 px-3 py-6 backdrop-blur-xl md:flex lg:w-64">
      <div>
        <Link to="/home" className="mb-6 flex items-center justify-center gap-2.5 px-2 lg:justify-start">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-flame">
            <FlameIcon className="h-5 w-5" fill="#fff" strokeWidth={1.5} />
          </span>
          <span className="hidden text-xl font-black lg:inline">FriendLy</span>
        </Link>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const q = new FormData(e.currentTarget).get("q")?.toString().trim();
            navigate({ to: "/discover", search: q ? { q } : {} });
            e.currentTarget.reset();
          }}
          className="mb-5 hidden items-center gap-2.5 rounded-full border border-line bg-surface-2 px-4 py-2.5 text-sm transition focus-within:border-white/30 lg:flex"
        >
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            type="search"
            name="q"
            placeholder="Search people…"
            className="w-full bg-transparent text-white placeholder:text-white/35 focus:outline-none"
          />
        </form>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              params={to === "/profile/$username" ? { username: user?.username ?? "" } : undefined}
              className={navClass}
              activeProps={{ className: "text-white!" }}
              aria-label={label}
              title={label}
            >
              {navItem(icon, label)}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={signOut}
        className={`${navClass} w-full`}
        aria-label="Log out"
        title="Log out"
      >
        <LogOut className="h-5 w-5 shrink-0" />
        <span className="hidden flex-1 truncate text-left lg:block">Log out</span>
      </button>

      {/* Profile card */}
      <Link
        to="/profile/$username"
        params={{ username: user?.username ?? "" }}
        className="flex items-center justify-center gap-3 rounded-full text-left transition-colors lg:justify-start lg:border lg:border-line lg:bg-surface lg:p-2 lg:pr-4 lg:hover:bg-surface-2"
        aria-label="Your profile"
      >
        <img
          src={user?.avatar ?? "https://i.pravatar.cc/40?img=12"}
          alt="Your avatar"
          className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/10"
        />
        <div className="hidden min-w-0 flex-1 lg:block">
          <p className="truncate text-sm font-semibold text-white">{user?.first_name} {user?.last_name}</p>
          <p className="truncate text-xs text-white/50">@{user?.username}</p>
        </div>
      </Link>
      </div>
    </aside>
  );
}

/** Bottom tab bar shown below md, where the sidebar is hidden. */
export function MobileNav(): React.JSX.Element {
  const { user } = useAuthStore.getState();

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-line pb-[env(safe-area-inset-bottom)] md:hidden">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          params={to === "/profile/$username" ? { username: user?.username ?? "" } : undefined}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white/55 transition-colors hover:text-white"
          activeProps={{ className: "bg-white/8 text-white!" }}
          aria-label={label}
        >
          {({ isActive }: { isActive: boolean }) => (
            <Icon className="h-5.5 w-5.5" strokeWidth={isActive ? 2.4 : 2} />
          )}
        </Link>
      ))}
    </nav>
  );
}
