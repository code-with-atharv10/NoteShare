import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, ArrowRight, UserPlus } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  university: z.string().optional(),
});
type RegisterForm = z.infer<typeof registerSchema>;

function passwordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { score: 0, label: "Too weak", color: "bg-destructive" },
    { score: 1, label: "Weak", color: "bg-orange-400" },
    { score: 2, label: "Fair", color: "bg-amber-400" },
    { score: 3, label: "Good", color: "bg-lime-500" },
    { score: 4, label: "Strong", color: "bg-green-500" },
    { score: 5, label: "Very strong", color: "bg-emerald-600" },
  ];
  return levels[score];
}

export default function Register() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const { toast } = useToast();
  const [passwordVal, setPasswordVal] = useState("");

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token);
        setLocation("/dashboard");
      },
      onError: (err: unknown) => {
        const msg = (err as { data?: { error?: string } })?.data?.error ?? "Registration failed";
        toast({ title: "Registration failed", description: msg, variant: "destructive" });
      },
    },
  });

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", university: "" },
  });

  const onSubmit = (values: RegisterForm) => {
    registerMutation.mutate({ data: values });
  };

  const strength = passwordStrength(passwordVal);

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

          <h1 className="text-3xl font-bold mb-1 font-serif">Join the commons</h1>
          <p className="text-muted-foreground mb-8">Create your free student account</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your name"
                        className="border-2 border-border h-11"
                        data-testid="input-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        placeholder="Min. 6 characters"
                        className="border-2 border-border h-11"
                        data-testid="input-password"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setPasswordVal(e.target.value);
                        }}
                      />
                    </FormControl>
                    {passwordVal && (
                      <div className="space-y-1 mt-1">
                        <Progress
                          value={(strength.score / 5) * 100}
                          className="h-1.5"
                        />
                        <p className="text-xs text-muted-foreground">{strength.label}</p>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">University <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MIT, Stanford, etc."
                        className="border-2 border-border h-11"
                        data-testid="input-university"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 font-bold border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] hover:translate-y-[2px] transition-all mt-2"
                disabled={registerMutation.isPending}
                data-testid="button-submit"
              >
                {registerMutation.isPending ? "Creating account..." : (
                  <><UserPlus className="mr-2 h-4 w-4" /> Create Account</>
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-2">
              Log in <ArrowRight className="inline h-3 w-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
