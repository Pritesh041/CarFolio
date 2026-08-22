import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, extractErrorMessage } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LogoMark } from "../../components/layout/icons";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { user, updateUser } = useAuth();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "done" | "error">(token ? "loading" : "error");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .post("/auth/verify-email", { token })
      .then(() => {
        setStatus("done");
        updateUser({ emailVerified: true });
      })
      .catch((err) => {
        setError(extractErrorMessage(err, "This link is invalid or has expired"));
        setStatus("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4 py-10">
      <Card className="w-full max-w-sm p-8 text-center sm:p-10">
        <Link to="/" className="inline-flex items-center gap-2 text-ink">
          <LogoMark />
          <span className="font-display text-lg font-semibold tracking-[0.08em]">CARFOLIO</span>
        </Link>

        <div className="mt-8">
          {status === "loading" && (
            <>
              <h2 className="font-display text-2xl font-bold text-ink">Verifying your email…</h2>
              <p className="mt-2 text-sm text-graphite-text">One moment.</p>
            </>
          )}
          {status === "done" && (
            <>
              <h2 className="font-display text-2xl font-bold text-ink">Email verified</h2>
              <p className="mt-2 text-sm text-graphite-text">Your email is confirmed. You're all set.</p>
              <Link to={user ? "/dashboard" : "/login"}>
                <Button className="mt-6 w-full" size="lg">
                  {user ? "Go to your garage" : "Go to sign in"}
                </Button>
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <h2 className="font-display text-2xl font-bold text-ink">Couldn't verify email</h2>
              <p className="mt-2 text-sm text-graphite-text">{error ?? "This verification link is missing its token."}</p>
              <Link to="/settings" className="mt-6 inline-block text-sm font-medium text-accent hover:underline">
                Go to settings to resend it
              </Link>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
