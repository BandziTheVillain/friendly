import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { AuthShell, FieldLabel } from "@/components/AuthShell";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/auth/sign-in")({
    head: () => seo({ title: "Sign in", description: "Sign in to Friendly to catch up with your friends, posts and friend requests.", path: "/auth/sign-in" }),
    component: Page,
    beforeLoad: () => {
        const { user } = useAuthStore.getState();
        if (user) {
            throw redirect({
                to: "/home",
            })
        }
    }
})

function Page() {
    const navigate = Route.useNavigate();

    const login = useAuthStore((state) => state.login);

    const form = useForm({
        defaultValues: {
            username: "",
            password: ""
        },
        onSubmit: async ({ value }) => {
            const res = await api.post("/auth/login/", value);
            login(res.data.user);
            navigate({ to: "/home" })
        }
    });

    const onSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
    };

    return (
        <AuthShell
            title="Hey, welcome back!"
            subtitle={<>New here? <Link className="font-semibold text-flame hover:underline" to="/auth/signup">Create an account</Link></>}
        >
            <form className="mt-7 grid gap-4" onSubmit={onSubmit}>
                <form.Field name="username">
                    {(field) => (
                        <label>
                            <FieldLabel>Username</FieldLabel>
                            <input type="text" autoComplete="username" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="field" placeholder="your_username" required />
                        </label>
                    )}
                </form.Field>

                <form.Field name="password">
                    {(field) => (
                        <label>
                            <FieldLabel>Password</FieldLabel>
                            <input type="password" autoComplete="current-password" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="field" placeholder="••••••••" required />
                        </label>
                    )}
                </form.Field>

                <Link to="/auth/forgot-password" className="-mt-1 justify-self-end text-xs font-medium text-white/50 hover:text-white">
                    Forgot password?
                </Link>

                <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                {([canSubmit, isSubmitting]) => (
                    <button className="btn-primary mt-1 w-full py-3.5" type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : 'Sign in'}
                    </button>
                )}
                </form.Subscribe>
            </form>
        </AuthShell>
    )
}
