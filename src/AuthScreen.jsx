import { useState } from "react";
import { supabase } from "./supabase";

export default function AuthScreen() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setMsg("");
    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      if (error) setError(error.message);
      else setMsg("Password reset email sent — check your inbox.");
      setLoading(false);
      return;
    }
    const { error } = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    if (error) setError(error.message);
    else if (mode === "signup") setMsg("Check your email to confirm your account.");
    setLoading(false);
  };

  const googleLogin = () => supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin }
  });

  const inp = {
    padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.1)",
    background: "#1c2238", color: "#eef0fa", fontFamily: "'DM Sans',sans-serif",
    fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box"
  };

  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c0e16", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700&family=DM+Sans:wght@400;600&display=swap')`}</style>
      <div style={{ width: 360, padding: 32, background: "#141828", borderRadius: 20, border: "1px solid rgba(255,255,255,.07)", boxShadow: "0 24px 60px rgba(0,0,0,.5)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: "linear-gradient(135deg,#c084fc,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 4px 20px rgba(192,132,252,.4)", fontSize: 20 }}>⚡</div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: "#eef0fa", letterSpacing: "-.5px", margin: 0 }}>FlowSpace</h1>
          <p style={{ color: "#7a85a3", fontSize: 13, marginTop: 4 }}>{mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset your password"}</p>
        </div>
        {mode === "reset" && <p style={{ color: "#7a85a3", fontSize: 12, textAlign: "center", marginBottom: 12, lineHeight: 1.5 }}>Enter your email and we'll send you a link to set a new password.</p>}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input style={inp} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          {mode !== "reset" && <input style={inp} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />}
          {error && <p style={{ color: "#ef4444", fontSize: 12, textAlign: "center", margin: 0 }}>{error}</p>}
          {msg && <p style={{ color: "#22c55e", fontSize: 12, textAlign: "center", margin: 0 }}>{msg}</p>}
          <button type="submit" disabled={loading} style={{ padding: 11, borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#c084fc,#818cf8)", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans',sans-serif", opacity: loading ? .7 : 1 }}>
            {loading ? "…" : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Email"}
          </button>
        </form>
        {mode === "login" && (
          <p style={{ textAlign: "center", marginTop: 12, marginBottom: 0, fontSize: 12 }}>
            <span onClick={() => { setMode("reset"); setError(""); setMsg(""); }} style={{ color: "#7a85a3", cursor: "pointer", textDecoration: "underline" }}>Forgot password?</span>
          </p>
        )}
        {mode === "reset" && (
          <p style={{ textAlign: "center", marginTop: 12, marginBottom: 0, fontSize: 12 }}>
            <span onClick={() => { setMode("login"); setError(""); setMsg(""); }} style={{ color: "#c084fc", cursor: "pointer", fontWeight: 600 }}>← Back to sign in</span>
          </p>
        )}
        {mode !== "reset" && <div style={{ textAlign: "center", margin: "16px 0", color: "#7a85a3", fontSize: 12 }}>or</div>}
        {mode !== "reset" && <button onClick={googleLogin} style={{ width: "100%", padding: 11, borderRadius: 10, border: "1px solid rgba(255,255,255,.1)", cursor: "pointer", background: "transparent", color: "#eef0fa", fontWeight: 600, fontSize: 14, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxSizing: "border-box" }}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>}
        {mode !== "reset" && (
          <p style={{ textAlign: "center", marginTop: 20, color: "#7a85a3", fontSize: 13 }}>
            {mode === "login" ? "Don't have an account? " : "Already have one? "}
            <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setMsg(""); }} style={{ color: "#c084fc", cursor: "pointer", fontWeight: 600 }}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

const shellCard = {
  height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
  background: "#0c0e16", fontFamily: "'DM Sans',sans-serif"
};
const innerCard = {
  width: 360, padding: 32, background: "#141828", borderRadius: 20,
  border: "1px solid rgba(255,255,255,.07)", boxShadow: "0 24px 60px rgba(0,0,0,.5)", textAlign: "center"
};

export function SignupSuccess({ onContinue }) {
  return (
    <div style={shellCard}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700&family=DM+Sans:wght@400;600&display=swap')`}</style>
      <div style={innerCard}>
        <div style={{ fontSize: 56, marginBottom: 14 }}>😊</div>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: "#eef0fa", letterSpacing: "-.5px", margin: 0 }}>You're all set!</h1>
        <p style={{ color: "#7a85a3", fontSize: 14, marginTop: 10, lineHeight: 1.6 }}>
          Your FlowSpace account is confirmed. Welcome aboard — let's get your day organized. 🎉
        </p>
        <button onClick={onContinue} style={{ width: "100%", marginTop: 24, padding: 12, borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#c084fc,#818cf8)", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans',sans-serif" }}>
          Start using FlowSpace
        </button>
      </div>
    </div>
  );
}

export function ResetPassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else setDone(true);
    setLoading(false);
  };

  const inp = {
    padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.1)",
    background: "#1c2238", color: "#eef0fa", fontFamily: "'DM Sans',sans-serif",
    fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box"
  };

  return (
    <div style={shellCard}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700&family=DM+Sans:wght@400;600&display=swap')`}</style>
      <div style={innerCard}>
        {done ? (
          <>
            <div style={{ fontSize: 56, marginBottom: 14 }}>😊</div>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: "#eef0fa", margin: 0 }}>Password updated!</h1>
            <p style={{ color: "#7a85a3", fontSize: 14, marginTop: 10 }}>You can now use your new password.</p>
            <button onClick={onDone} style={{ width: "100%", marginTop: 24, padding: 12, borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#c084fc,#818cf8)", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans',sans-serif" }}>
              Continue to FlowSpace
            </button>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: "#eef0fa", margin: 0 }}>Set a new password</h1>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
              <input style={inp} type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              {error && <p style={{ color: "#ef4444", fontSize: 12, margin: 0 }}>{error}</p>}
              <button type="submit" disabled={loading} style={{ padding: 11, borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#c084fc,#818cf8)", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans',sans-serif", opacity: loading ? .7 : 1 }}>
                {loading ? "…" : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
