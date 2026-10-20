import { Link } from "@tanstack/react-router";
import { FlameIcon } from "lucide-react";

interface Props {
    title: string;
    subtitle: React.ReactNode;
    children: React.ReactNode;
}

/** Centered card layout shared by the sign-in / sign-up screens. */
export const AuthShell = ({ title, subtitle, children }: Props) => {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-12 text-white">
            <div className="relative w-full max-w-md animate-fade-up">
                <Link to="/" className="mx-auto mb-8 flex w-fit items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-flame">
                        <FlameIcon className="h-6 w-6" fill="#fff" strokeWidth={1.5} />
                    </span>
                    <span className="text-xl font-extrabold">FireFriends</span>
                </Link>

                <div className="card p-8">
                    <h2 className="text-3xl font-extrabold">{title}</h2>
                    <p className="mt-1.5 text-sm text-white/55">{subtitle}</p>
                    {children}
                </div>

                <p className="mt-6 text-center text-xs text-white/30">© 2026 FireFriends</p>
            </div>
        </div>
    )
}

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <span className="mb-1.5 block text-sm font-medium text-white/75">{children}</span>
)
