import React from "react";
import { MessageCircle, MoreHorizontal } from "lucide-react";
import { useTimestamp } from "@/hooks/useTimestamp";
import { CommentForm } from "./CommentForm";
import { formatCount } from "@/lib/utils";
import { LikeButton } from "./LikeButton";
import { Link } from "@tanstack/react-router";

interface PostProps {
  post: Post;
}

export default function PostMedia({ post }: PostProps): React.JSX.Element {
  const { author, text, date_created, image, comment_count } = post;

  return (
    <article className="card mb-4 overflow-hidden transition-colors hover:border-white/12">
      <div className="flex gap-3 p-4 pb-2">
        <Link to="/profile/$username" params={{ username: author.username }} className="shrink-0">
          <img
            src={author.avatar}
            alt={author.username}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10 transition hover:ring-flame/50"
          />
        </Link>
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-start gap-2">
            <Link
              to="/profile/$username"
              params={{ username: author.username }}
              className="min-w-0 leading-tight hover:underline"
            >
              <span className="block truncate text-[15px] font-bold text-white">
                {author.first_name} {author.last_name}
              </span>
              <span className="block truncate text-[13px] text-white/40">
                @{author.username} · {useTimestamp(date_created)}
              </span>
            </Link>
            <button
              className="ml-auto shrink-0 rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Text */}
          <p className="mt-2.5 whitespace-pre-wrap text-[15px] leading-relaxed text-white/90">
            {text}
          </p>

          {/* Media */}
          {image && (
            <img
              className="mt-3 aspect-video w-full rounded-2xl border border-line object-cover"
              src={image}
              alt=""
            />
          )}

          {/* Actions */}
          <div className="-ml-2 mt-2 flex items-center gap-2 text-white/45">
            <Link
              to="/posts/$id/comments"
              params={{ id: post.id }}
              className="group flex items-center gap-1 rounded-full pr-3 transition-colors hover:text-sky"
            >
              <span className="rounded-full p-2 group-hover:bg-sky/10">
                <MessageCircle className="h-4.5 w-4.5" />
              </span>
              <span className="text-xs font-bold">{formatCount(comment_count)}</span>
            </Link>

            <LikeButton post={post} />
          </div>
        </div>
      </div>
      <div className="border-t border-line bg-white/[0.015] px-4 py-3">
        <CommentForm postID={post.id} />
      </div>
    </article>
  );
}
