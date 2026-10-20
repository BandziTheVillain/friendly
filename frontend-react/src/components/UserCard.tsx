import { errorMessage, sendFriendRequest } from "@/lib/friends"
import { Link } from "@tanstack/react-router"
import { Check, UserRoundPlusIcon, Users } from "lucide-react"
import { useState } from "react"
import { toast } from "react-toastify"

interface UserCardProps {
  user: User;
  /** Tighter layout for sidebars */
  compact?: boolean;
};

export const SuggestedUserCard = ({ user, compact = false }: UserCardProps) => {
  const [relationship, setRelationship] = useState<Relationship>(user.relationship ?? "none");
  const [sending, setSending] = useState(false);

  const sendRequest = async () => {
    setSending(true);
    try {
      setRelationship(await sendFriendRequest(user.username));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  const badgeClass = `flex shrink-0 items-center gap-1 rounded-full border border-mint/25 bg-mint/10 font-semibold text-mint ${compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"}`;

  return (
      <div className={`flex w-full items-center gap-3 rounded-xl transition-colors hover:bg-white/3 ${compact ? "p-1.5" : "p-3"}`}>
        <Link to="/profile/$username" params={{ username: user.username }} className="shrink-0">
          <img
            src={user.avatar}
            className={`rounded-full object-cover ring-2 ring-white/10 ${compact ? "h-11 w-11" : "h-14 w-14"}`}
            alt=""
          />
        </Link>
        <Link to="/profile/$username" params={{ username: user.username }} className="min-w-0 flex-1 hover:underline">
          <p className={`truncate font-semibold ${compact ? "text-sm" : ""}`}>{user.first_name} {user.last_name}</p>
          <p className="truncate text-xs text-white/45">@{user.username}</p>
        </Link>

        {relationship === "none" && (
          <button
            type="button"
            onClick={sendRequest}
            disabled={sending}
            className={`btn-primary shrink-0 disabled:opacity-60 ${compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}`}
          >
            <UserRoundPlusIcon className="h-4 w-4" />
            <span>Add</span>
          </button>
        )}
        {relationship === "request_sent" && (
          <span className={badgeClass}>
            <Check className="h-3.5 w-3.5" />
            Sent
          </span>
        )}
        {relationship === "request_received" && (
          <Link to="/connect/friend-requests" className={`${badgeClass} hover:opacity-80`}>
            Respond
          </Link>
        )}
        {relationship === "friends" && (
          <span className={badgeClass}>
            <Users className="h-3.5 w-3.5" />
            Friends
          </span>
        )}
      </div>
  )
}
