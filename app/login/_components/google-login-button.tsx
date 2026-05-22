"use client";

function GoogleIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10"
        r="8"
        stroke="#00101A"
        strokeWidth="2.5"
        strokeDasharray="40"
        strokeDashoffset="10"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface GoogleLoginButtonProps {
  /** When true, render as a submit button (used inside <form action={...}>). */
  pending?: boolean;
  /** Visible label. Defaults to 'LOGIN With Google' for backward compatibility. */
  label?: string;
}

export default function GoogleLoginButton({
  pending = false,
  label = "LOGIN With Google",
}: GoogleLoginButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      aria-label={label}
      className={[
        "flex items-center justify-start gap-2 rounded-lg transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E]/60",
        pending
          ? "cursor-not-allowed opacity-70"
          : "hover:shadow-[0_4px_24px_rgba(255,234,158,0.35)] hover:brightness-105 active:scale-[0.98]",
      ].join(" ")}
      style={{
        width: 305,
        height: 60,
        padding: "16px 24px",
        backgroundColor: "#FFEA9E",
      }}
    >
      <span className="flex items-center gap-2 flex-1">
        <span
          className="font-bold text-center"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 22,
            fontWeight: 700,
            lineHeight: "28px",
            letterSpacing: "0px",
            color: "#00101A",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </span>
      <span className="flex-shrink-0">
        {pending ? <SpinnerIcon /> : <GoogleIcon />}
      </span>
    </button>
  );
}
