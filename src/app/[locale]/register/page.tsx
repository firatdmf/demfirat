"use client";
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import classes from './page.module.css';
import { FcGoogle } from 'react-icons/fc';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaUserCircle } from 'react-icons/fa';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto login after registration
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Registration successful but login failed. Please login manually.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
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
    <div className={classes.registerContainer}>
      <div className={classes.registerCard}>
        {/* Logo Section */}
        <div className={classes.logoSection}>
          <img 
            src="/media/karvenLogo.webp" 
            alt="Karven Logo" 
            className={classes.logo}
          />
          <h1 className={classes.title}>Create Account</h1>
          <p className={classes.subtitle}>Join Karven family today</p>
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
          <span>Sign up with Google</span>
        </button>

        {/* Divider */}
        <div className={classes.divider}>
          <span>or</span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className={classes.form}>
          {/* Full Name */}
          <div className={classes.inputGroup}>
            <div className={classes.inputWrapper}>
              <FaUserCircle className={classes.inputIcon} />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className={classes.input}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div className={classes.inputGroup}>
            <div className={classes.inputWrapper}>
              <FaEnvelope className={classes.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={classes.input}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Username */}
          <div className={classes.inputGroup}>
            <div className={classes.inputWrapper}>
              <FaUser className={classes.inputIcon} />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className={classes.input}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className={classes.inputGroup}>
            <div className={classes.inputWrapper}>
              <FaLock className={classes.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                className={classes.input}
                required
                disabled={loading}
                minLength={6}
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
          </div>

          <button
            type="submit"
            className={classes.submitButton}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className={classes.footer}>
          <p className={classes.loginLink}>
            Already have an account? <Link href="/login">Sign in</Link>
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
