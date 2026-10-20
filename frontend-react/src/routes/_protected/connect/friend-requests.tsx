import { useState } from "react";
import { Search, Check, X, LoaderCircle } from "lucide-react";
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Connect from "@/components/Connect";
import { useTimestamp } from "@/hooks/useTimestamp";
import {
  FRIENDS_QUERY_KEY,
  type RequestBox,
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  errorMessage,
  friendRequestsKey,
  getFriendRequests,
} from "@/lib/friends";

export const Route = createFileRoute('/_protected/connect/friend-requests')({
  component: Page,
})

/** What happened to a request on this page; the row stays visible with a badge until the next refetch. */
type Outcome = "accepted" | "declined" | "cancelled";

const BOXES: { id: RequestBox; label: string }[] = [
  { id: "incoming", label: "Received" },
  { id: "outgoing", label: "Sent" },
];

function Page() {
  const [box, setBox] = useState<RequestBox>("incoming");
  const [query, setQuery] = useState("");
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const client = useQueryClient();

  const { data, isPending, isError } = useQuery({
    queryKey: friendRequestsKey(box),
    queryFn: () => getFriendRequests(box),
  });
  const requests = data?.results ?? [];

  const respond = async (req: FriendRequest, outcome: Outcome) => {
    setBusyId(req.id);
    try {
      if (outcome === "accepted") await acceptFriendRequest(req.id);
      if (outcome === "declined") await declineFriendRequest(req.id);
      if (outcome === "cancelled") await cancelFriendRequest(req.id);
      setOutcomes((prev) => ({ ...prev, [req.id]: outcome }));
      // refresh the tab badge, suggestions, etc. — but not this list, so the row's badge stays visible
      const thisList = friendRequestsKey(box);
      client.invalidateQueries({
        queryKey: [FRIENDS_QUERY_KEY],
        predicate: (q) => q.queryKey.join("/") !== thisList.join("/"),
      });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const otherPerson = (req: FriendRequest) => (box === "incoming" ? req.sender : req.recepient);

  const needle = query.trim().toLowerCase();
  const visible = requests.filter((req) => {
    const u = otherPerson(req);
    return !needle || `${u.first_name} ${u.last_name} ${u.username}`.toLowerCase().includes(needle);
  });
  const pendingCount = requests.filter((r) => !outcomes[r.id]).length;

  return (
    <Connect>
      {/* Received / Sent */}
      <div className="mb-4 flex gap-1 rounded-full border border-line bg-surface-2 p-1">
        {BOXES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setBox(id)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              box === id ? "bg-white text-black" : "text-white/50 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 rounded-full border border-line bg-surface-2 px-4 py-3 transition focus-within:border-white/30">
        <Search className="h-4 w-4 text-white/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search requests"
          className="w-full bg-transparent text-[15px] text-white placeholder:text-white/40 focus:outline-none"
        />
      </div>

      {isPending ? (
        <div className="flex h-40 items-center justify-center text-white/50">
          <LoaderCircle size={28} className="animate-spin" />
        </div>
      ) : isError ? (
        <p className="px-1 pt-6 text-center text-sm text-white/40">Couldn't load requests. Try again in a bit.</p>
      ) : (
        <>
          <div className="mt-5 px-1">
            <p className="text-sm text-white/50">
              {pendingCount} pending request{pendingCount !== 1 && "s"}
            </p>
          </div>

          {visible.length > 0 && (
            <div className="card mt-2 divide-y divide-line p-2">
              {visible.map((req) => (
                <RequestRow
                  key={req.id}
                  request={req}
                  user={otherPerson(req)}
                  box={box}
                  outcome={outcomes[req.id]}
                  busy={busyId === req.id}
                  onRespond={(outcome) => respond(req, outcome)}
                />
              ))}
            </div>
          )}

          {pendingCount === 0 && (
            <p className="px-1 pt-6 text-center text-sm text-white/40">
              {box === "incoming"
                ? "You're all caught up — no pending requests."
                : "No sent requests waiting on a reply."}
            </p>
          )}
        </>
      )}
    </Connect>
  );
}

interface RequestRowProps {
  request: FriendRequest;
  user: User;
  box: RequestBox;
  outcome?: Outcome;
  busy: boolean;
  onRespond: (outcome: Outcome) => void;
}

function RequestRow({ request, user, box, outcome, busy, onRespond }: RequestRowProps) {
  const time = useTimestamp(request.date_created);
  const name = `${user.first_name} ${user.last_name}`.trim() || user.username;

  return (
    <div className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/3">
      <Link to="/profile/$username" params={{ username: user.username }} className="shrink-0">
        <img
          src={user.avatar}
          alt={name}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-white/10"
        />
      </Link>
      <Link to="/profile/$username" params={{ username: user.username }} className="min-w-0 flex-1 hover:underline">
        <p className="truncate text-[15px] font-semibold">{name}</p>
        <p className="truncate text-sm text-white/40">@{user.username}</p>
        <p className="mt-0.5 truncate text-xs text-white/40">{time}</p>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        {!outcome && box === "incoming" && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onRespond("declined")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:bg-white/6 hover:text-white disabled:opacity-50"
              aria-label={`Decline ${name}`}
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onRespond("accepted")}
              className="flex h-9 w-9 items-center justify-center rounded-full btn-primary text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              aria-label={`Accept ${name}`}
            >
              <Check className="h-4 w-4" />
            </button>
          </>
        )}
        {!outcome && box === "outgoing" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onRespond("cancelled")}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/60 transition-colors hover:bg-white/6 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        {outcome === "accepted" && (
          <span className="rounded-full border border-mint/30 bg-mint/10 px-3 py-1.5 text-xs font-semibold text-mint">
            Accepted
          </span>
        )}
        {(outcome === "declined" || outcome === "cancelled") && (
          <span className="rounded-full border border-white/10 bg-white/3 px-3 py-1.5 text-xs font-semibold text-white/40">
            {outcome === "declined" ? "Declined" : "Cancelled"}
          </span>
        )}
      </div>
    </div>
  );
}
