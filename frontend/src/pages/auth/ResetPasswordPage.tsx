import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, extractErrorMessage } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FieldGroup, Input } from "../../components/ui/Field";
import { LogoMark } from "../../components/layout/icons";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setIsDone(true);
    } catch (err) {
      setError(extractErrorMessage(err, "This link is invalid or has expired"));
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

        {!token ? (
          <div className="mt-8">
            <h2 className="font-display text-2xl font-bold text-ink">Invalid link</h2>
            <p className="mt-2 text-sm text-graphite-text">
              This password reset link is missing its token. Request a new one below.
            </p>
            <Link to="/forgot-password" className="mt-6 inline-block text-sm font-medium text-accent hover:underline">
              Request a new link
            </Link>
          </div>
        ) : isDone ? (
          <div className="mt-8">
            <h2 className="font-display text-2xl font-bold text-ink">Password updated</h2>
            <p className="mt-2 text-sm text-graphite-text">Your password has been reset. You can sign in now.</p>
            <Button className="mt-6 w-full" size="lg" onClick={() => navigate("/login")}>
              Go to sign in
            </Button>
          </div>
        ) : (
          <>
            <h2 className="mt-8 font-display text-2xl font-bold text-ink">Set a new password</h2>
            <p className="mt-1 text-sm text-graphite-text">Choose a new password for your account.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <FieldGroup label="New password">
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </FieldGroup>

              {error && <p className="text-sm text-negative">{error}</p>}

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Reset password"}
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
