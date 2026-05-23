import { useState, useEffect, useRef } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { DisplayContentEnum } from "../../../shared/Constants";
import { UserLoginDTO, UserRegisterDTO } from "../../../../server/types";
import { useLoginMutation } from "../../../hooks/mutations/useLoginMutation";
import { useRegisterMutation } from "../../../hooks/mutations/useRegisterMutation";
import { useAssetManagementContext } from "../../ContextProvider/ContextProvider";

// ─── Brand mark ───────────────────────────────────────────────────────────────
function BrandMark() {
  return (
    <div className="lp-brand-mark">
      <span className="dot">₹</span>
      <span className="wm">Asset Manager<em> · personal</em></span>
    </div>
  );
}

// ─── Portfolio preview (teaser on brand panel) ────────────────────────────────
function PortfolioPreview() {
  return (
    <div className="lp-preview" aria-hidden="true">
      <div className="lp-preview-head">
        <div>
          <div className="lbl">Your net worth</div>
          <div className="nw">₹14.32L</div>
          <div className="delta">
            <span className="mi">trending_up</span>
            +₹19,800 · +1.4% MoM
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="live">
            <span className="pulse" />
            Live
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--lp-text-sec)", marginTop: 4 }}>
            16 May 2026 · 11:25
          </div>
        </div>
      </div>

      <div className="lp-preview-mid">
        <div style={{ width: 70, height: 70, flexShrink: 0 }}>
          <svg width="70" height="70" viewBox="0 0 70 70">
            <circle cx="35" cy="35" r="27" fill="none" stroke="var(--lp-surface-3)" strokeWidth="9" />
            <circle cx="35" cy="35" r="27" fill="none" stroke="#4FC3F7" strokeWidth="9"
              strokeDasharray="139 170" transform="rotate(-90 35 35)" strokeLinecap="butt" />
            <circle cx="35" cy="35" r="27" fill="none" stroke="#4caf50" strokeWidth="9"
              strokeDasharray="25 170" strokeDashoffset="-139" transform="rotate(-90 35 35)" />
            <circle cx="35" cy="35" r="27" fill="none" stroke="#9575cd" strokeWidth="9"
              strokeDasharray="4 170" strokeDashoffset="-164" transform="rotate(-90 35 35)" />
            <circle cx="35" cy="35" r="27" fill="none" stroke="#78909c" strokeWidth="9"
              strokeDasharray="2 170" strokeDashoffset="-168" transform="rotate(-90 35 35)" />
          </svg>
        </div>
        <div className="lp-preview-rows">
          {[
            { color: "#4FC3F7", label: "Equity MF", val: "₹7.93L · 55%" },
            { color: "#4caf50", label: "EPF + VPF", val: "₹5.72L · 40%" },
            { color: "#9575cd", label: "LIC", val: "₹2.94L · 21%" },
            { color: "#78909c", label: "Cash + RE", val: "₹77K · 5%" },
          ].map((r) => (
            <div key={r.label} className="row">
              <span className="l"><span className="sw" style={{ background: r.color }} />{r.label}</span>
              <span className="v">{r.val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lp-preview-spark">
        <div className="lbl-row">
          <span>12 month net worth</span>
          <span style={{ color: "var(--lp-good)" }}>+11.4%</span>
        </div>
        <svg width="100%" height="36" viewBox="0 0 400 36" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lp-sg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#4FC3F7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4FC3F7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 0 28 L 30 26 L 60 27 L 90 24 L 120 23 L 150 20 L 180 18 L 210 16 L 240 15 L 270 12 L 300 10 L 330 8 L 360 6 L 400 4"
            fill="none" stroke="#4FC3F7" strokeWidth="1.6" />
          <path d="M 0 28 L 30 26 L 60 27 L 90 24 L 120 23 L 150 20 L 180 18 L 210 16 L 240 15 L 270 12 L 300 10 L 330 8 L 360 6 L 400 4 L 400 36 L 0 36 Z"
            fill="url(#lp-sg)" />
        </svg>
      </div>
    </div>
  );
}

// ─── Brand panel ───────────────────────────────────────────────────────────────
function BrandPanel() {
  return (
    <div className="lp-brand">
      <BrandMark />

      <div className="lp-brand-body">
        <div>
          <h1>Watch every rupee. <em>Plan every decade.</em></h1>
          <p className="lead">
            One private dashboard for your MFs, EPF, LIC, stocks, loans and cash —
            with inflation-adjusted projections so you know what your money is really worth in 20 years.
          </p>
        </div>
        <PortfolioPreview />
      </div>

      <div className="lp-trust">
        {[
          { icon: "lock", title: "Encrypted, on-device first", sub: "Your portfolio is encrypted client-side. We can't read it — not even on a court order." },
          { icon: "visibility_off", title: "Never asks for bank passwords", sub: "Add holdings manually or via screenshot OCR. No screen-scraping, no aggregator risk." },
          { icon: "currency_rupee", title: "Built for Indian investors", sub: "EPF, VPF, NPS, LIC, SIPs, ELSS, HUF, ₹ formatting. Default inflation tied to India CPI." },
        ].map((b) => (
          <div key={b.icon} className="row">
            <span className="ic"><span className="mi">{b.icon}</span></span>
            <div className="t">{b.title}<span className="s">{b.sub}</span></div>
          </div>
        ))}
      </div>

      <div className="lp-brand-foot">
        <span>© 2026 Asset Manager</span>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Security</a>
        <a href="#" style={{ marginLeft: "auto" }}>Status · operational</a>
      </div>
    </div>
  );
}

// ─── OTP entry ────────────────────────────────────────────────────────────────
function OtpEntry({ phone, onBack, onVerify }: { phone: string; onBack: () => void; onVerify: () => void }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(28);
  const inputRef = useRef<HTMLInputElement>(null);
  const focusIdx = digits.findIndex((d) => d === "");
  const canSubmit = digits.every((d) => d !== "");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const last = [...digits].reverse().findIndex((d) => d !== "");
      if (last === -1) return;
      const idx = 5 - last;
      setDigits((prev) => { const n = [...prev]; n[idx] = ""; return n; });
    } else if (/^\d$/.test(e.key)) {
      const next = digits.findIndex((d) => d === "");
      if (next === -1) return;
      setDigits((prev) => { const n = [...prev]; n[next] = e.key; return n; });
    }
  };

  const autoFill = () => setDigits(["4", "8", "2", "7", "1", "6"]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (canSubmit) onVerify(); }}>
      <div className="lp-field" style={{ marginBottom: 8 }}>
        <label>
          Enter the 6-digit code
          <span className="hint">
            sent to +91 {phone || "98765 43210"}
            <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} style={{ marginLeft: 8 }}>Change</a>
          </span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            ref={inputRef}
            className="lp-otp-real-input"
            type="tel"
            inputMode="numeric"
            maxLength={6}
            onKeyDown={handleKey}
            onChange={() => {}}
            value={digits.join("")}
            tabIndex={0}
          />
          <div className="lp-otp" onClick={() => inputRef.current?.focus()}>
            {digits.map((d, i) => (
              <div key={i} className={`box${d ? " filled" : ""}${i === focusIdx ? " focus" : ""}`}>
                {d || (i === focusIdx ? <span className="caret" /> : "")}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lp-otp-meta">
        <span>Didn't get it?</span>
        <span className={`resend${timer > 0 ? " dis" : ""}`} onClick={() => { if (timer === 0) setTimer(28); }}>
          {timer > 0 ? `Resend in 0:${String(timer).padStart(2, "0")}` : "Resend code"}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button type="button" className="lp-btn lp-btn-secondary" onClick={autoFill}>
          <span className="mi">auto_fix_high</span>
          Auto-fill from SMS
        </button>
      </div>

      <button className="lp-btn lp-btn-primary" disabled={!canSubmit}>
        Verify &amp; sign in
        <span className="mi">arrow_forward</span>
      </button>
    </form>
  );
}

// ─── Sign-in form ─────────────────────────────────────────────────────────────
function SignInForm({
  method,
  isPending,
  errorMsg,
  onEmailSubmit,
}: {
  method: string;
  isPending: boolean;
  errorMsg: string;
  onEmailSubmit: (email: string, password: string) => void;
}) {
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => { setOtpSent(false); }, [method]);

  const canSubmitEmail = email.includes("@") && pwd.length >= 6;
  const canSendOtp = phone.replace(/\D/g, "").length === 10;

  if (method === "phone") {
    if (otpSent) {
      return <OtpEntry phone={phone} onBack={() => setOtpSent(false)} onVerify={() => {}} />;
    }
    return (
      <form onSubmit={(e) => { e.preventDefault(); if (canSendOtp) setOtpSent(true); }}>
        {errorMsg && (
          <div className="lp-error-msg">
            <span className="mi">error_outline</span>
            {errorMsg}
          </div>
        )}
        <div className="lp-field">
          <label htmlFor="lp-phone">Mobile number</label>
          <div className="lp-ctrl">
            <span className="adorn code">+91</span>
            <input id="lp-phone" type="tel" placeholder="98765 43210"
              value={phone} onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel" maxLength={11} />
            <span className="right-ic mi" title="Why we ask">help</span>
          </div>
          <div className="helper">We'll text a 6-digit code. Standard SMS rates apply.</div>
        </div>
        <button className="lp-btn lp-btn-primary" disabled={!canSendOtp} style={{ marginTop: 6 }}>
          Send code <span className="mi">send</span>
        </button>
      </form>
    );
  }

  // email
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (canSubmitEmail) onEmailSubmit(email, pwd); }}>
      {errorMsg && (
        <div className="lp-error-msg">
          <span className="mi">error_outline</span>
          {errorMsg}
        </div>
      )}
      <div className="lp-field">
        <label htmlFor="lp-email">Email</label>
        <div className="lp-ctrl">
          <span className="adorn mi">mail</span>
          <input id="lp-email" type="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
      </div>

      <div className="lp-field">
        <label htmlFor="lp-pwd">
          Password
          <a href="#">Forgot?</a>
        </label>
        <div className="lp-ctrl">
          <span className="adorn mi">lock</span>
          <input id="lp-pwd" type={showPwd ? "text" : "password"} placeholder="••••••••••"
            value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="current-password" />
          <span className="right-ic mi" onClick={() => setShowPwd(!showPwd)}>
            {showPwd ? "visibility_off" : "visibility"}
          </span>
        </div>
      </div>

      <div className="lp-form-row">
        <label className="lp-check">
          <input type="checkbox" defaultChecked />
          Trust this device for 30 days
        </label>
      </div>

      <button data-testid="sign-in-btn" className="lp-btn lp-btn-primary" disabled={!canSubmitEmail || isPending}>
        {isPending ? "Signing in…" : "Sign in"}
        <span className="mi">arrow_forward</span>
      </button>
    </form>
  );
}

// ─── Register form ────────────────────────────────────────────────────────────
function RegisterForm({
  method,
  isPending,
  errorMsg,
  onRegister,
}: {
  method: string;
  isPending: boolean;
  errorMsg: string;
  onRegister: (name: string, email: string, password: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pwd, setPwd] = useState("");
  const [agree, setAgree] = useState(true);

  const strength = (() => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  })();
  const strengthLabels = ["", "Too short", "Weak", "Okay", "Strong", "Excellent"];
  const strengthColors = ["", "var(--lp-bad)", "var(--lp-warn)", "var(--lp-accent)", "var(--lp-good)"];

  const canSubmit =
    name.length >= 2 &&
    agree &&
    strength >= 2 &&
    (method === "email" ? email.includes("@") : phone.replace(/\D/g, "").length === 10);

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (canSubmit) onRegister(name, email, pwd); }}>
      {errorMsg && (
        <div className="lp-error-msg">
          <span className="mi">error_outline</span>
          {errorMsg}
        </div>
      )}
      <div className="lp-notice">
        <span className="mi">verified_user</span>
        <div>Free forever for personal use. No credit card. Delete your data anytime — we keep zero backups.</div>
      </div>

      <div className="lp-field">
        <label htmlFor="lp-name">Your name</label>
        <div className="lp-ctrl">
          <span className="adorn mi">person</span>
          <input id="lp-name" placeholder="Vikram Iyer"
            value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
      </div>

      {method === "email" ? (
        <div className="lp-field">
          <label htmlFor="lp-r-email">Email</label>
          <div className="lp-ctrl">
            <span className="adorn mi">mail</span>
            <input id="lp-r-email" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="helper">We'll send a verification link. Login uses this same email.</div>
        </div>
      ) : (
        <div className="lp-field">
          <label htmlFor="lp-r-phone">Mobile number</label>
          <div className="lp-ctrl">
            <span className="adorn code">+91</span>
            <input id="lp-r-phone" type="tel" placeholder="98765 43210"
              value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" maxLength={11} />
          </div>
          <div className="helper">We'll verify with a one-time code. Login uses this number going forward.</div>
        </div>
      )}

      <div className="lp-field">
        <label htmlFor="lp-r-pwd">
          Create password
          {pwd && (
            <span className="hint" style={{ color: strengthColors[strength] }}>
              {strengthLabels[strength]}
            </span>
          )}
        </label>
        <div className="lp-ctrl">
          <span className="adorn mi">lock</span>
          <input id="lp-r-pwd" type="password" placeholder="At least 8 characters"
            value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="new-password" />
        </div>
        <div className={`lp-strength lv${strength}`}>
          <span /><span /><span /><span />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, fontSize: 11, color: "var(--lp-text-sec)" }}>
        <span>Default currency</span>
        <span className="lp-inline-select">₹ INR · India <span className="mi">expand_more</span></span>
        <span style={{ marginLeft: "auto" }}>Inflation 6.0%</span>
      </div>

      <label className="lp-check" style={{ marginBottom: 16, alignItems: "flex-start" }}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 2 }} />
        <span style={{ fontSize: 12, lineHeight: 1.5 }}>
          I agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a>. I understand projections are estimates, not investment advice.
        </span>
      </label>

      <button data-testid="create-account-btn" className="lp-btn lp-btn-primary" disabled={!canSubmit || isPending}>
        {isPending ? "Creating account…" : "Create account"} <span className="mi">arrow_forward</span>
      </button>
    </form>
  );
}

// ─── Auth panel ───────────────────────────────────────────────────────────────
function AuthPanel({
  mode,
  setMode,
  method,
  setMethod,
  isPending,
  errorMsg,
  onEmailSubmit,
  registerPending,
  registerErrorMsg,
  onRegister,
}: {
  mode: string;
  setMode: (m: string) => void;
  method: string;
  setMethod: (m: string) => void;
  isPending: boolean;
  errorMsg: string;
  onEmailSubmit: (email: string, password: string) => void;
  registerPending: boolean;
  registerErrorMsg: string;
  onRegister: (name: string, email: string, password: string) => void;
}) {
  const isSignIn = mode === "signin";
  return (
    <div className="lp-auth-panel">
      <div className="lp-auth-wrap">
        <div className="lp-mobile-brand">
          <BrandMark />
        </div>

        <div className="lp-auth-head">
          <h2>{isSignIn ? "Welcome back" : "Create your account"}</h2>
          <div className="sub">
            {isSignIn ? (
              <>New here? <a href="#" onClick={(e) => { e.preventDefault(); setMode("register"); }}>Create an account →</a></>
            ) : (
              <>Already have one? <a href="#" onClick={(e) => { e.preventDefault(); setMode("signin"); }}>Sign in →</a></>
            )}
          </div>
        </div>

        <div className="lp-mode-tabs" role="tablist">
          <button role="tab" aria-selected={isSignIn} className={isSignIn ? "on" : ""} onClick={() => setMode("signin")}>Sign in</button>
          <button role="tab" aria-selected={!isSignIn} className={!isSignIn ? "on" : ""} onClick={() => setMode("register")}>Create account</button>
        </div>

        <div className="lp-method-tabs" role="tablist">
          <button role="tab" aria-selected={method === "phone"} className={method === "phone" ? "on" : ""} onClick={() => setMethod("phone")}>
            <span className="mi">smartphone</span> Phone
          </button>
          <button role="tab" aria-selected={method === "email"} className={method === "email" ? "on" : ""} onClick={() => setMethod("email")}>
            <span className="mi">mail</span> Email
          </button>
        </div>

        {isSignIn
          ? <SignInForm method={method} isPending={isPending} errorMsg={errorMsg} onEmailSubmit={onEmailSubmit} />
          : <RegisterForm method={method} isPending={registerPending} errorMsg={registerErrorMsg} onRegister={onRegister} />}

        <div className="lp-or">or continue with</div>
        <button className="lp-btn lp-btn-google">
          <span className="g-icon" />
          {isSignIn ? "Sign in with Google" : "Continue with Google"}
        </button>

        <div className="lp-auth-foot">
          By continuing you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
          <br />
          Need help? <a href="#">help@assetmanager.app</a>
        </div>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
const Login = () => {
  const { createToken } = useLoginMutation();
  const { registerUser } = useRegisterMutation();
  const { showSnackbar } = useAssetManagementContext();
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin");
  const [method, setMethod] = useState("email");
  const [errorMsg, setErrorMsg] = useState("");
  const [registerErrorMsg, setRegisterErrorMsg] = useState("");

  const handleEmailSubmit = async (email: string, password: string) => {
    setErrorMsg("");
    try {
      const loginData: UserLoginDTO = { email, password };
      const response = await createToken.mutateAsync({ data: loginData });
      if (response?.status === "success") {
        sessionStorage.setItem("token", response.token);
        navigate(`${DisplayContentEnum.dashboard}`);
      }
    } catch {
      const msg = "Invalid email or password. Please try again.";
      setErrorMsg(msg);
      showSnackbar(msg, "error");
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    setRegisterErrorMsg("");
    try {
      const registerData: UserRegisterDTO = { name, email, password };
      const response = await registerUser.mutateAsync({ data: registerData });
      if (response?.status === "success") {
        if (response.token) {
          sessionStorage.setItem("token", response.token);
          navigate(`${DisplayContentEnum.dashboard}`);
        } else {
          showSnackbar("Account created! Please sign in.", "success");
          setMode("signin");
        }
      }
    } catch {
      const msg = "Registration failed. Please try again.";
      setRegisterErrorMsg(msg);
      showSnackbar(msg, "error");
    }
  };

  return (
    <div className="lp-page">
      <BrandPanel />
      <AuthPanel
        mode={mode}
        setMode={setMode}
        method={method}
        setMethod={setMethod}
        isPending={createToken.isPending}
        errorMsg={errorMsg}
        onEmailSubmit={handleEmailSubmit}
        registerPending={registerUser.isPending}
        registerErrorMsg={registerErrorMsg}
        onRegister={handleRegister}
      />
    </div>
  );
};

export default Login;
