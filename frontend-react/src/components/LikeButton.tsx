import { api } from "@/lib/api"
import { formatCount } from "@/lib/utils"
import { useAuthStore } from "@/store/auth"
import { useQueryClient } from "@tanstack/react-query"
import { Heart } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

interface Props {
    post: Post
}

export const LikeButton = ({ post }: Props) => {
    const { user } = useAuthStore.getState();
    const client = useQueryClient();
    // states
    const [like, setLike] = useState<Like|null>(null);
    const [isLoading ,setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchLike = async () => {
            setIsLoading(true);
            try {
                const res = await api.get("/likes/", { params: { post_id: post.id, user: user!.username } });
                setLike(res.data?.results[0] ?? null);
            } finally {
                setIsLoading(false);
            }
        }
        fetchLike();
    }, [post.id]);

    const toggleLike = async () => {
        try {
            const res = await api.post(`/posts/${post.id}/like/`);
            const like = res.data.like;
            setLike(like);
        } catch (err: any) {
            toast.error("Something went wrong");
            throw new Error(err)
        } finally {
            client.invalidateQueries({ queryKey: ["user-timeline"] })
        }
    }

    return (
        <button
            onClick={toggleLike}
            disabled={isLoading}
            className={`group flex items-center gap-1 rounded-full pr-3 transition-colors disabled:opacity-80 ${
            like ? "text-flame" : "hover:text-flame"
            }`}
            >
              <span className="rounded-full p-2 group-hover:bg-flame/10">
                <Heart
                  className={`h-4.5 w-4.5 transition-transform group-active:scale-125`}
                  fill={like ? "currentColor" : "none"}
                />
              </span>
              <span className="text-xs font-bold">{formatCount(post.like_count)}</span>
            </button>
    )
}
