import { formatDate } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

interface Props {
    comment: IComment;
}

export const CommentItem = ({ comment }:Props) => {
    const { text, user, date_created } = comment;

    return (
        <div className="flex gap-3">
            <Link to="/profile/$username" params={{ username: user.username }} className="shrink-0">
                <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10" />
            </Link>
            <div className="min-w-0 flex-1">
                <div className="inline-block max-w-full rounded-2xl rounded-tl-md bg-surface-2 px-4 py-2.5">
                    <Link to="/profile/$username" params={{ username: user.username }} className="flex items-baseline gap-1.5 hover:underline">
                        <span className="truncate text-sm font-semibold">{user.first_name} {user.last_name}</span>
                        <span className="truncate text-xs text-white/40">@{user.username}</span>
                    </Link>
                    <p className="mt-0.5 whitespace-pre-wrap text-[15px] leading-relaxed text-white/90">{text}</p>
                </div>
                <p className="mt-1 pl-4 text-xs font-medium text-white/35">{formatDate(date_created)}</p>
            </div>
        </div>
    )
}
