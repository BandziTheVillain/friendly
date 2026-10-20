import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getIncomingRequestCount, incomingCountKey } from "@/lib/friends";

export default function PeopleTabs() {
  const { data: incomingCount } = useQuery({
    queryKey: incomingCountKey,
    queryFn: getIncomingRequestCount,
  });

  const linkBase =
    "relative px-4 py-3 text-sm font-semibold transition-colors text-white/40 hover:text-white/70";
  const activeClass = "text-white!";
  const indicator = (
    <span className="absolute inset-x-3 bottom-0 h-0.75 rounded-full bg-flame" />
  );

  return (
    <div className="flex px-2">
      <Link
        to="/connect/suggested-friends"
        className={linkBase}
        activeProps={{ className: activeClass }}
      >
        {({ isActive }: { isActive: boolean }) => (
          <>
            Suggested
            {isActive && indicator}
          </>
        )}
      </Link>

      <Link
        to="/connect/friend-requests"
        className={linkBase}
        activeProps={{ className: activeClass }}
      >
        {({ isActive }: { isActive: boolean }) => (
          <>
            Requests
            {!!incomingCount && (
              <span className="ml-1.5 rounded-full bg-flame px-1.5 py-px text-[10px] font-bold text-white">
                {incomingCount}
              </span>
            )}
            {isActive && indicator}
          </>
        )}
      </Link>
    </div>
  );
}
