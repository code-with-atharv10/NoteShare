import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, ArrowRight, LogIn } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const { toast } = useToast();

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token);
        setLocation("/dashboard");
      },
      onError: (err: unknown) => {
        const msg = (err as { data?: { error?: string } })?.data?.error ?? "Invalid email or password";
        toast({ title: "Login failed", description: msg, variant: "destructive" });
      },
    },
  });

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginForm) => {
    loginMutation.mutate({ data: values });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="bg-card border-2 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] rounded-xl p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">NoteShare</span>
          </div>

          <h1 className="text-3xl font-bold mb-1 font-serif">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Log in to your academic commons</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@university.edu"
                        className="border-2 border-border h-11"
                        data-testid="input-email"
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
                    <FormLabel className="font-semibold">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="border-2 border-border h-11"
                        data-testid="input-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 font-bold border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] hover:translate-y-[2px] transition-all"
                disabled={loginMutation.isPending}
                data-testid="button-submit"
              >
                {loginMutation.isPending ? "Logging in..." : (
                  <><LogIn className="mr-2 h-4 w-4" /> Log In</>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Demo account</p>
            <p className="text-sm font-mono">aarav@example.com / password123</p>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            No account yet?{" "}
            <Link href="/register" className="font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-2">
              Sign up <ArrowRight className="inline h-3 w-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
