"use client";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import "../envelope.css";

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Link href="/" className={`login-back-link ${playfair.className}`}>
          &larr; Back to Wedding
        </Link>
        <h1 className={`login-title ${playfair.className}`}>ADMIN LOGIN</h1>
        <p className={`login-subtitle ${playfair.className}`}>Sign in to view RSVP submissions</p>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className={`login-error ${playfair.className}`}>{error}</div>}

          <div className="login-field">
            <label htmlFor="email" className={playfair.className}>Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className={playfair.className}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password" className={playfair.className}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className={playfair.className}
            />
          </div>

          <button type="submit" className={`login-button ${playfair.className}`} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
