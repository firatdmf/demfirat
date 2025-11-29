"use client";
import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import classes from './page.module.css';
import { FcGoogle } from 'react-icons/fc';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace(`/${locale}`);
    }
  }, [session, status, router, locale]);

  // Show nothing while checking auth status or redirecting
  if (status === 'loading' || (status === 'authenticated' && session)) {
    return (
      <div className={classes.loginContainer}>
        <div className={classes.loadingSpinner}></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className={classes.loginContainer}>
      <div className={classes.loginCard}>
        {/* Logo Section */}
        <div className={classes.logoSection}>
          <img
            src="/media/karvenLogo.webp"
            alt="Karven Logo"
            className={classes.logo}
          />
          <h1 className={classes.title}>Welcome Back</h1>
          <p className={classes.subtitle}>Sign in to access your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={classes.errorMessage}>
            {error}
          </div>
        )}

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          className={classes.googleButton}
          disabled={loading}
        >
          <FcGoogle className={classes.googleIcon} />
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className={classes.divider}>
          <span>or</span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className={classes.form}>
          <div className={classes.inputGroup}>
            <div className={classes.inputWrapper}>
              <FaUser className={classes.inputIcon} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={classes.input}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={classes.inputGroup}>
            <div className={classes.inputWrapper}>
              <FaLock className={classes.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={classes.input}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={classes.togglePassword}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="text-right mt-2">
              <Link
                href="/forgot-password"
                className="text-sm text-yellow-600 hover:text-yellow-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className={classes.submitButton}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className={classes.footer}>
          <p className={classes.registerLink}>
            Don't have an account? <Link href="/register">Sign up</Link>
          </p>
          <Link href="/" className={classes.backLink}>
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Background Decoration */}
      <div className={classes.backgroundPattern}></div>
    </div>
  );
}
