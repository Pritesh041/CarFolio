import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, extractErrorMessage } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FieldGroup, Input } from "../../components/ui/Field";
import { LogoMark } from "../../components/layout/icons";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post("/auth/forgot-password", { email });
      setIsSent(true);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't send the reset email"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4 py-10">
      <Card className="w-full max-w-sm p-8 sm:p-10">
        <Link to="/" className="inline-flex items-center gap-2 text-ink">
          <LogoMark />
          <span className="font-display text-lg font-semibold tracking-[0.08em]">CARFOLIO</span>
        </Link>

        {isSent ? (
          <div className="mt-8">
            <h2 className="font-display text-2xl font-bold text-ink">Check your email</h2>
            <p className="mt-2 text-sm text-graphite-text">
              If an account exists for <span className="font-medium text-ink">{email}</span>, we've sent a link to
              reset your password. It expires in an hour.
            </p>
            <Link to="/login" className="mt-6 inline-block text-sm font-medium text-accent hover:underline">
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h2 className="mt-8 font-display text-2xl font-bold text-ink">Forgot your password?</h2>
            <p className="mt-1 text-sm text-graphite-text">
              Enter your email and we'll send you a link to reset it.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <FieldGroup label="Email">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </FieldGroup>

              {error && <p className="text-sm text-negative">{error}</p>}

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send reset link"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-graphite-text">
              <Link to="/login" className="font-medium text-accent hover:underline">
                ← Back to sign in
              </Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
