import { createFileRoute, Link } from "@tanstack/react-router";
import { FlameIcon, Heart, MessageCircle, UserRoundPlus } from "lucide-react";

export const Route = createFileRoute("/")({
    component: Page,
})

function Page() {
    return (
        <div className="relative flex min-h-screen w-full items-center overflow-hidden bg-ink text-white">
            <div className="relative mx-auto grid w-full max-w-6xl items-center gap-16 px-6 py-16 lg:grid-cols-2">
                <main className="animate-fade-up">
                    <div className="mb-8 flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-flame">
                            <FlameIcon className="h-7 w-7" fill="#fff" strokeWidth={1.5} />
                        </span>
                        <span className="text-2xl font-extrabold">FireFriends</span>
                    </div>

                    <h1 className="text-5xl font-black leading-[1.1] sm:text-6xl">
                        Hang out with your <span className="text-flame">people.</span>
                    </h1>
                    <p className="mt-5 max-w-md text-lg text-white/60">
                        Share what you're up to, see what your friends are doing, and meet some new ones along the way.
                    </p>

                    <div className="mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
                        <Link to="/auth/signup" className="btn-primary flex-1 px-6 py-3.5">
                            Join for free
                        </Link>
                        <Link to="/auth/sign-in" className="btn-ghost flex-1 px-6 py-3.5">
                            Sign in
                        </Link>
                    </div>

                    <p className="mt-12 text-sm text-white/35">© 2026 FireFriends. All rights reserved.</p>
                </main>

                {/* Preview card stack */}
                <section aria-hidden className="relative hidden h-105 lg:block">
                    <div className="card absolute right-6 top-0 w-80 rotate-3 p-4 shadow-xl shadow-black/30">
                        <div className="flex items-center gap-3">
                            <img src="https://i.pravatar.cc/80?img=32" className="h-10 w-10 rounded-full object-cover" alt="" />
                            <div>
                                <p className="text-sm font-bold">Maya Chen</p>
                                <p className="text-xs text-white/40">@maya · 2h</p>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-white/80">Bonfire at the beach tonight 🔥 who's in?</p>
                        <div className="mt-3 aspect-video rounded-xl bg-ember/80" />
                        <div className="mt-3 flex gap-4 text-xs font-bold text-white/50">
                            <span className="flex items-center gap-1 text-flame"><Heart className="h-4 w-4" fill="currentColor" /> 128</span>
                            <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> 24</span>
                        </div>
                    </div>

                    <div className="card absolute bottom-6 left-0 w-72 -rotate-3 animate-float p-4 shadow-xl shadow-black/30">
                        <p className="mb-3 text-sm font-bold text-white/50">Leo wants to be friends 👋</p>
                        <div className="flex items-center gap-3">
                            <img src="https://i.pravatar.cc/80?img=15" className="h-11 w-11 rounded-full object-cover ring-2 ring-flame/40" alt="" />
                            <div className="flex-1">
                                <p className="text-sm font-bold">Leo Park</p>
                                <p className="text-xs text-white/40">12 mutual friends</p>
                            </div>
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-flame">
                                <UserRoundPlus className="h-4 w-4" />
                            </span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
