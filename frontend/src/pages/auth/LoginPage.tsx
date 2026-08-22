import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { extractErrorMessage } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FieldGroup, Input } from "../../components/ui/Field";
import { LogoMark } from "../../components/layout/icons";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(extractErrorMessage(err, "Invalid email or password"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-ivory lg:flex-row">
      {/* Editorial panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between bg-ink px-14 py-12 text-paper">
        <Link to="/" className="inline-flex items-center gap-2 text-paper">
          <LogoMark />
          <span className="font-display text-lg font-semibold tracking-[0.08em]">CARFOLIO</span>
        </Link>

        <div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-paper sm:text-6xl">
            Welcome back to your garage.
          </h1>
          <p className="mt-5 max-w-md text-base text-neutral-300">
            Track every car you own, showcase the ones you're proud of, and trade with collectors who
            know the difference between a project and a keeper.
          </p>
        </div>

        <p className="text-xs uppercase tracking-wide text-neutral-500">Carfolio — for the collection that matters.</p>
      </div>

      {/* Mobile branding strip */}
      <div className="flex flex-col gap-1 bg-ivory px-6 pt-8 lg:hidden">
        <Link to="/" className="inline-flex items-center gap-2 text-ink">
          <LogoMark />
          <span className="font-display text-lg font-semibold tracking-[0.08em]">CARFOLIO</span>
        </Link>
        <p className="pl-9 text-sm text-graphite-text">Welcome back to your garage.</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 lg:w-1/2 lg:px-12">
        <Card className="w-full max-w-sm p-8 sm:p-10">
          <h2 className="font-display text-3xl font-bold text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-graphite-text">Enter your credentials to access your garage.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <FieldGroup label="Email">
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </FieldGroup>
            <FieldGroup label="Password">
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </FieldGroup>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-medium text-accent hover:underline">
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-sm text-negative">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-graphite-text">
            New to Carfolio?{" "}
            <Link to="/signup" className="font-medium text-accent hover:underline">
              Create an account
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
