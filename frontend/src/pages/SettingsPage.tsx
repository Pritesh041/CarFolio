import { useState } from "react";
import { useAuth } from "../lib/auth";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ThemeSwitcher } from "../components/ui/ThemeSwitcher";

export function SettingsPage() {
  const { user, logout, resendVerification } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleResend() {
    setIsSending(true);
    try {
      await resendVerification();
      setSent(true);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-10">
      <h1 className="font-display text-4xl font-bold text-ink">Settings</h1>

      <Card className="max-w-lg divide-y divide-line p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-xs font-medium uppercase tracking-wide text-graphite-text">Name</span>
          <span className="text-sm font-medium text-ink">{user?.name}</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-xs font-medium uppercase tracking-wide text-graphite-text">Username</span>
          <span className="text-sm font-medium text-ink">@{user?.username}</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-xs font-medium uppercase tracking-wide text-graphite-text">Email</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-ink">{user?.email}</span>
            {user?.emailVerified ? (
              <Badge tone="success">Verified</Badge>
            ) : (
              <Badge tone="warning">Unverified</Badge>
            )}
          </div>
        </div>
        {user && !user.emailVerified && (
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-sm text-graphite-text">
              {sent ? "Verification email sent — check your inbox." : "Verify your email to secure your account."}
            </p>
            {!sent && (
              <Button size="sm" variant="secondary" onClick={handleResend} disabled={isSending}>
                {isSending ? "Sending…" : "Resend email"}
              </Button>
            )}
          </div>
        )}
      </Card>

      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Theme</h2>
        <p className="mt-1 text-sm text-graphite-text">Pick the look and feel of your Carfolio.</p>
        <div className="mt-4">
          <ThemeSwitcher />
        </div>
      </div>

      <Button variant="danger" onClick={logout}>
        Sign out
      </Button>
    </div>
  );
}
