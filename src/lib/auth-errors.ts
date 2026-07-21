import type { AuthError } from "@supabase/supabase-js";

export type AuthErrorField = "email" | "password" | "form";

export interface MappedAuthError {
  /** Short, user-friendly toast message. */
  toast: string;
  /** Longer inline guidance shown near the offending field. */
  inline: string;
  /** Which field to attach the inline message to. */
  field: AuthErrorField;
}

interface RawErrorLike {
  message?: string;
  code?: string;
  status?: number;
  name?: string;
}

/**
 * Maps Supabase auth errors (and other sign-in/sign-up failures) to a
 * consistent, user-friendly shape. Uses Supabase `code` when available
 * and falls back to message/status heuristics for older SDKs.
 *
 * Reference: https://supabase.com/docs/guides/auth/debugging/error-codes
 */
export function mapAuthError(err: unknown): MappedAuthError {
  const e = (err ?? {}) as RawErrorLike & Partial<AuthError>;
  const code = (e.code ?? "").toString().toLowerCase();
  const msg = (e.message ?? "").toString();
  const status = typeof e.status === "number" ? e.status : 0;
  const m = msg.toLowerCase();

  const byCode: Record<string, MappedAuthError> = {
    invalid_credentials: {
      toast: "Incorrect email or password",
      inline: "Double-check your email and password, or reset your password if you've forgotten it.",
      field: "password",
    },
    email_not_confirmed: {
      toast: "Please confirm your email first",
      inline: "We sent a confirmation link to your inbox. Click it to activate your account, then sign in again.",
      field: "email",
    },
    user_not_found: {
      toast: "No account found for that email",
      inline: "Check the email address or create a new account.",
      field: "email",
    },
    user_banned: {
      toast: "This account is suspended",
      inline: "Contact support to restore access to this account.",
      field: "form",
    },
    email_exists: {
      toast: "An account already exists for that email",
      inline: "Try signing in instead, or reset your password if you've forgotten it.",
      field: "email",
    },
    user_already_exists: {
      toast: "An account already exists for that email",
      inline: "Try signing in instead, or reset your password if you've forgotten it.",
      field: "email",
    },
    signup_disabled: {
      toast: "New sign-ups are temporarily disabled",
      inline: "Please try again later or contact support if this persists.",
      field: "form",
    },
    weak_password: {
      toast: "Please choose a stronger password",
      inline: "Use at least 8 characters with a mix of letters and numbers. Avoid common or previously leaked passwords.",
      field: "password",
    },
    same_password: {
      toast: "New password must be different",
      inline: "Choose a password you haven't used on this account before.",
      field: "password",
    },
    over_request_rate_limit: {
      toast: "Too many attempts — please wait a moment",
      inline: "For your security we've paused sign-in briefly. Try again in a minute.",
      field: "form",
    },
    over_email_send_rate_limit: {
      toast: "Too many emails sent — please wait",
      inline: "We've hit an hourly email limit. Try again in about an hour.",
      field: "email",
    },
    email_address_invalid: {
      toast: "That email address isn't valid",
      inline: "Enter a valid email like name@example.com.",
      field: "email",
    },
    validation_failed: {
      toast: "Please check the highlighted fields",
      inline: "Some of the information you entered isn't valid.",
      field: "form",
    },
    session_not_found: {
      toast: "Your session has expired",
      inline: "Please sign in again to continue.",
      field: "form",
    },
    otp_expired: {
      toast: "That link has expired",
      inline: "Request a new confirmation or password reset email and try again.",
      field: "form",
    },
    otp_disabled: {
      toast: "This sign-in method isn't available",
      inline: "Use email and password, or another available provider.",
      field: "form",
    },
    provider_disabled: {
      toast: "This sign-in provider isn't enabled",
      inline: "Try another sign-in method, or contact support.",
      field: "form",
    },
    provider_email_needs_verification: {
      toast: "Verify your email with the provider first",
      inline: "Confirm the email on your provider account, then try signing in again.",
      field: "email",
    },
    bad_oauth_state: {
      toast: "Sign-in was interrupted",
      inline: "Please try signing in again.",
      field: "form",
    },
    bad_oauth_callback: {
      toast: "Sign-in was interrupted",
      inline: "Please try signing in again.",
      field: "form",
    },
    oauth_provider_not_supported: {
      toast: "This provider isn't supported",
      inline: "Try another sign-in method.",
      field: "form",
    },
  };

  if (code && byCode[code]) return byCode[code];

  // Status-based fallbacks
  if (status === 429) {
    return {
      toast: "Too many attempts — please wait a moment",
      inline: "For your security we've paused sign-in briefly. Try again in a minute.",
      field: "form",
    };
  }

  // Message heuristics for older SDKs / edge cases
  if (/invalid login credentials|invalid_credentials|incorrect/i.test(m)) return byCode.invalid_credentials;
  if (/email.*not.*confirm/i.test(m)) return byCode.email_not_confirmed;
  if (/already registered|already exists|already been registered/i.test(m)) return byCode.email_exists;
  if (/weak password|password.*short|at least/i.test(m)) return byCode.weak_password;
  if (/rate.?limit|too many/i.test(m)) return byCode.over_request_rate_limit;
  if (/user not found/i.test(m)) return byCode.user_not_found;
  if (/network|fetch|failed to fetch/i.test(m)) {
    return {
      toast: "Can't reach the server",
      inline: "Check your internet connection and try again.",
      field: "form",
    };
  }

  return {
    toast: "Something went wrong. Please try again.",
    inline: msg || "An unexpected error occurred. Please try again in a moment.",
    field: "form",
  };
}
