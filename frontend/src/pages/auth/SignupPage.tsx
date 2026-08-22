import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { extractErrorMessage } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FieldGroup, Input } from "../../components/ui/Field";
import { LogoMark } from "../../components/layout/icons";

export function SignupPage() {
  const { requestSignup, confirmSignup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"details" | "code">("details");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleDetailsSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await requestSignup(name, username, email, password);
      setStep("code");
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't start creating your account"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCodeSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await confirmSignup(email, code);
      navigate("/dashboard");
    } catch (err) {
      setError(extractErrorMessage(err, "That code is invalid or has expired"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setIsResending(true);
    setError(null);
    try {
      await requestSignup(name, username, email, password);
      setResent(true);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't resend the code"));
    } finally {
      setIsResending(false);
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
            Start your garage.
          </h1>
          <p className="mt-5 max-w-md text-base text-neutral-300">
            Catalog your cars, showcase your builds, and connect with a community of collectors who take
            it as seriously as you do.
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
        <p className="pl-9 text-sm text-graphite-text">Every collection starts with one car.</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 lg:w-1/2 lg:px-12">
        <Card className="w-full max-w-sm p-8 sm:p-10">
          {step === "details" ? (
            <>
              <h2 className="font-display text-3xl font-bold text-ink">Create account</h2>
              <p className="mt-1 text-sm text-graphite-text">Every collection starts with one car.</p>

              <form onSubmit={handleDetailsSubmit} className="mt-8 space-y-4">
                <FieldGroup label="Name">
                  <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Pritesh Bhatasana" />
                </FieldGroup>
                <FieldGroup label="Username">
                  <Input
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                    placeholder="pritesh"
                  />
                </FieldGroup>
                <FieldGroup label="Email">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </FieldGroup>
                <FieldGroup label="Password">
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
                  {isSubmitting ? "Sending code…" : "Continue"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-graphite-text">
                Already collecting?{" "}
                <Link to="/login" className="font-medium text-accent hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-3xl font-bold text-ink">Check your email</h2>
              <p className="mt-1 text-sm text-graphite-text">
                We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>. Enter it below to
                finish creating your account.
              </p>

              <form onSubmit={handleCodeSubmit} className="mt-8 space-y-4">
                <FieldGroup label="Verification code">
                  <Input
                    required
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="text-center text-lg tracking-[0.3em]"
                  />
                </FieldGroup>

                {error && <p className="text-sm text-negative">{error}</p>}
                {resent && !error && <p className="text-sm text-racing-green">A new code is on its way.</p>}

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || code.length !== 6}>
                  {isSubmitting ? "Verifying…" : "Verify & create account"}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("details");
                    setError(null);
                    setResent(false);
                  }}
                  className="font-medium text-graphite-text hover:text-ink"
                >
                  ← Edit details
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-medium text-accent hover:underline disabled:opacity-60"
                >
                  {isResending ? "Resending…" : "Resend code"}
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
