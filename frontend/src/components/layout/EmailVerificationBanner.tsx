import { useState } from "react";
import { useAuth } from "../../lib/auth";

export function EmailVerificationBanner() {
  const { user, resendVerification } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user || user.emailVerified) return null;

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
    <div className="flex flex-wrap items-center justify-center gap-2 bg-warning-soft px-4 py-2 text-center text-sm text-warning">
      <span>
        {sent
          ? "Verification email sent — check your inbox."
          : "Please verify your email address to secure your account."}
      </span>
      {!sent && (
        <button
          type="button"
          onClick={handleResend}
          disabled={isSending}
          className="font-semibold underline decoration-dotted hover:no-underline disabled:opacity-60"
        >
          {isSending ? "Sending…" : "Resend email"}
        </button>
      )}
    </div>
  );
}
