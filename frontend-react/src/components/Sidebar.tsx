import React from "react";
import { Home, Compass, User, FlameIcon, Search, Users } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Link } from "@tanstack/react-router";

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
      <span className="relative z-10 flex-1 truncate text-left">{label}</span>
    </>
  );

const navClass =
  "group relative flex items-center gap-3 rounded-full px-4 py-2.5 text-[15px] font-semibold text-white/55 transition-colors hover:bg-white/5 hover:text-white";

export default function Sidebar(): React.JSX.Element {
  const { user } = useAuthStore.getState();

  return (
    <aside className="sticky top-0 z-20 flex h-screen w-64 shrink-0 flex-col justify-between border-r border-line bg-ink/80 px-3 py-6 backdrop-blur-xl">
      <div>
        {/* Wordmark */}
        <Link to="/home" className="mb-6 flex items-center gap-2.5 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-flame">
            <FlameIcon className="h-5 w-5" fill="#fff" strokeWidth={1.5} />
          </span>
          <span className="text-xl font-black">FireFriends</span>
        </Link>

        <label className="mb-5 flex items-center gap-2.5 rounded-full border border-line bg-surface-2 px-4 py-2.5 text-sm transition focus-within:border-white/30">
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            type="search"
            placeholder="Search…"
            className="w-full bg-transparent text-white placeholder:text-white/35 focus:outline-none"
          />
        </label>

        <nav className="flex flex-col gap-1">
          <Link to="/home" className={navClass} activeProps={{ className: "text-white!" }}>
            {navItem(Home, "Home")}
          </Link>
          <Link to="/discover" className={navClass} activeProps={{ className: "text-white!" }}>
            {navItem(Compass, "Discover")}
          </Link>
          <Link to="/suggested-friends" className={navClass} activeProps={{ className: "text-white!" }}>
            {navItem(Users, "Make friends")}
          </Link>
          <Link
            to="/profile/$username"
            params={{ username: user?.username ?? "" }}
            className={navClass}
            activeProps={{ className: "text-white!" }}
          >
            {navItem(User, "Profile")}
          </Link>
        </nav>
      </div>

      {/* Profile card */}
      <Link
        to="/profile/$username"
        params={{ username: user?.username ?? "" }}
        className="flex items-center gap-3 rounded-full border border-line bg-surface p-2 pr-4 text-left transition-colors hover:bg-surface-2"
      >
        <img
          src={user?.avatar ?? "https://i.pravatar.cc/40?img=12"}
          alt="Your avatar"
          className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{user?.first_name} {user?.last_name}</p>
          <p className="truncate text-xs text-white/50">@{user?.username}</p>
        </div>
      </Link>
    </aside>
  );
}
