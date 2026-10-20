import { CommentForm } from '@/components/CommentForm';
import { CommentItem } from '@/components/CommentItem';
import { Layout } from '@/components/Layout'
import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowLeft, LoaderCircle, MessageCircle } from 'lucide-react';

async function getComments(id: string) : Promise<APIResponse<IComment>> {
    const res = await api.get(`/comments?post_id=${id}`);
    return res.data;
}

export const Route = createFileRoute('/_protected/posts/$id/comments')({
  component: Page,
})

function Page() {
    const { id:postId } = Route.useParams();
    const router = useRouter();

    const { data, isLoading, error } = useQuery({
        queryKey: [`comments-${postId}`, postId],
        queryFn: () => getComments(postId)
    });

    const results = data?.results ?? [];

    let body: React.ReactNode;
    if (isLoading) {
        body = (
            <div className="flex justify-center py-16 text-white/50">
                <LoaderCircle className="animate-spin" />
            </div>
        );
    } else if (error) {
        body = <p className="py-16 text-center text-sm text-white/50">Something went wrong</p>;
    } else if (results.length === 0) {
        body = (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
                <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky/10">
                    <MessageCircle className="h-6 w-6 text-sky" />
                </span>
                <p className="font-semibold">No comments yet</p>
                <p className="text-sm text-white/45">Be the first to add one!</p>
            </div>
        );
    } else {
        body = results.map((comment) => <CommentItem key={comment.id} comment={comment} />);
    }

    return (
        <Layout>
            <div className="mx-auto flex h-screen max-w-2xl flex-col py-6">
                <div className="page-header flex items-center gap-3 rounded-t-2xl border border-line">
                    <button
                        onClick={() => router.history.back()}
                        className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/8 hover:text-white"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-extrabold">Comments</h1>
                        {!isLoading && !error && (
                            <p className="text-xs text-white/45">{results.length} {results.length === 1 ? "comment" : "comments"}</p>
                        )}
                    </div>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto border-x border-line bg-surface/60 p-5">
                    {body}
                </div>
                {!error && (
                    <div id="comment-list-footer" className="rounded-b-2xl border border-line bg-surface p-4">
                        <CommentForm postID={postId} queryKey={`comments-${postId}`} />
                    </div>
                )}
            </div>
        </Layout>
    )
}
