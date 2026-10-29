import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";
import { AuthShell, FieldLabel } from "@/components/AuthShell";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/auth/signup")({
    head: () => seo({ title: "Create your account", description: "Join Friendly for free. Share posts, make new friends and see what your people are up to.", path: "/auth/signup" }),
    component: Page,
    beforeLoad: () => {
        const { user } = useAuthStore.getState();
        if (user) {
            throw redirect({
                to: "/",
            })
        }
    }
})

function Page() {
    const navigate = Route.useNavigate();

    const form = useForm({
        defaultValues: {
            email: "",
            username: "",
            firstName: "",
            lastName: "",
            password1: "",
            password2: ""
        },
        onSubmit: async ({ value }) => {
            const { email, username, firstName, lastName, password1, password2 } = value;
            const data = {
                email,
                username,
                first_name: firstName,
                last_name: lastName,
                password1,
                password2
            };
            try {
                await api.post("/auth/registration/", data);
                toast.success("Successfully registered. You can now log-in.");
                navigate({ to: "/auth/sign-in" })
            } catch (err: any) {
                toast.error("Something went wrong.")
                throw new Error(err);
            }
        }
    });

    const onSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
    };

    return (
        <AuthShell
            title="Let's get you set up"
            subtitle={<>Already registered? <Link className="font-semibold text-flame hover:underline" to="/auth/sign-in">Sign in</Link></>}
        >
            <form className="mt-7 grid gap-4" onSubmit={onSubmit}>
                <div className="grid grid-cols-2 gap-3">
                    <form.Field name="firstName">
                        {(field) => (
                            <label>
                                <FieldLabel>First name</FieldLabel>
                                <input type="text" autoComplete="given-name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="field" placeholder="Jane" />
                            </label>
                        )}
                    </form.Field>
                    <form.Field name="lastName">
                        {(field) => (
                            <label>
                                <FieldLabel>Last name</FieldLabel>
                                <input type="text" autoComplete="family-name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="field" placeholder="Doe" />
                            </label>
                        )}
                    </form.Field>
                </div>

                <form.Field name="email">
                    {(field) => (
                        <label>
                            <FieldLabel>Email</FieldLabel>
                            <input type="email" autoComplete="email" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="field" placeholder="you@example.com" required />
                        </label>
                    )}
                </form.Field>

                <form.Field name="username">
                    {(field) => (
                        <label>
                            <FieldLabel>Username</FieldLabel>
                            <input type="text" autoComplete="username" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="field" placeholder="jane_doe" required />
                        </label>
                    )}
                </form.Field>

                <form.Field name="password1">
                    {(field) => (
                        <label>
                            <FieldLabel>Password</FieldLabel>
                            <input type="password" autoComplete="new-password" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="field" placeholder="••••••••" required />
                        </label>
                    )}
                </form.Field>

                <form.Field
                name="password2"
                validators={{
                    onChangeListenTo: ['password1'],
                    onChange: ({ value, fieldApi }) => {
                    // Compare with current password value
                    return value === fieldApi.form.getFieldValue('password1') ? undefined : 'Passwords do not match';
                    },
                }}
                >
                    {(field) => (
                        <label>
                            <FieldLabel>Confirm password</FieldLabel>
                            <input
                                type="password"
                                autoComplete="new-password"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                className={`field ${field.state.meta.errors.length ? "border-flame/70!" : ""}`}
                                placeholder="••••••••"
                                required
                            />
                            {field.state.meta.errors.length > 0 && (
                                <span className="mt-1.5 block text-xs text-flame">{field.state.meta.errors.join(", ")}</span>
                            )}
                        </label>
                    )}
                </form.Field>

                <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                {([canSubmit, isSubmitting]) => (
                    <button className="btn-primary mt-2 w-full py-3.5" type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : 'Sign me up'}
                    </button>
                )}
                </form.Subscribe>
            </form>
        </AuthShell>
    )
}
