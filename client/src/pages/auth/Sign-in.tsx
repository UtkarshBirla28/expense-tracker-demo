import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, Wallet } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useSignIn from "@/hooks/use-sign-in";

const signinSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type SigninFormValues = z.infer<typeof signinSchema>;

const DEMO_EMAIL = "demo@expensetracker.in";
const DEMO_PASSWORD = "demo1234";

export default function SigninPage() {
  const navigate = useNavigate();
  const form = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { signIn, loading, error, onSuccess } = useSignIn();

  useEffect(() => {
    if (onSuccess) {
      navigate("/");
    }
  }, [navigate, onSuccess]);

  const onSubmit = async (data: SigninFormValues) => {
    await signIn(data);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="animate-rise flex flex-col items-center text-center">
          <span className="animate-pop flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Wallet className="h-6 w-6" strokeWidth={2.2} />
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your Expense Tracker account
          </p>
        </div>

        <div
          className="animate-rise mt-8 rounded-xl border border-border bg-card p-6 shadow-sm"
          style={{ animationDelay: "120ms" }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-medium text-ink-secondary">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-medium text-ink-secondary">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <p className="rounded-lg bg-negative-soft px-3 py-2 text-sm text-negative">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="press inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </Form>
        </div>

        {/* Demo account for visitors/recruiters */}
        <div
          className="animate-rise mt-4 rounded-xl border border-primary/25 bg-primary/5 p-4"
          style={{ animationDelay: "220ms" }}
        >
          <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            Just looking around?
          </p>
          <p className="mt-1 text-sm text-ink-secondary">
            Explore the app with a pre-filled demo account — real dashboards,
            budgets, and goals, no signup needed.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Email <span className="font-medium text-foreground">{DEMO_EMAIL}</span>
            <span className="mx-1.5">·</span>
            Password <span className="font-medium text-foreground">{DEMO_PASSWORD}</span>
          </p>
          <button
            type="button"
            onClick={() => {
              form.setValue("email", DEMO_EMAIL);
              form.setValue("password", DEMO_PASSWORD);
              form.handleSubmit(onSubmit)();
            }}
            className="press mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg border border-primary/40 bg-card text-sm font-medium text-primary shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Try the demo account
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
