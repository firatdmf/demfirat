"use client";
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import classes from './page.module.css';

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    if (!token) {
        return (
            <div className={classes.loginContainer}>
                <div className={classes.loginCard}>
                    <div className={classes.logoSection}>
                        <img
                            src="/media/karvenLogo.webp"
                            alt="Karven Logo"
                            className={classes.logo}
                        />
                        <h1 className={classes.title} style={{ color: '#c33' }}>Invalid Link</h1>
                        <p className={classes.subtitle}>This password reset link is invalid or missing.</p>
                    </div>
                    <div className={classes.footer}>
                        <Link href="/login" className={classes.backLink}>
                            Go to Login
                        </Link>
                    </div>
                </div>
                <div className={classes.backgroundPattern}></div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('Password reset successfully!');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to reset password');
            }
        } catch (error) {
            setStatus('error');
            setMessage('An error occurred. Please try again.');
        }
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
                    <h1 className={classes.title}>Reset Password</h1>
                    <p className={classes.subtitle}>Enter your new password below</p>
                </div>

                {/* Messages */}
                {status === 'success' && (
                    <div className={classes.successMessage}>
                        <p>{message}</p>
                        <p style={{ fontSize: '13px', marginTop: '4px', opacity: 0.8 }}>Redirecting to login...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className={classes.errorMessage}>
                        {message}
                    </div>
                )}

                {status !== 'success' && (
                    <form onSubmit={handleSubmit} className={classes.form}>
                        <div className={classes.inputGroup}>
                            <div className={classes.inputWrapper}>
                                <FaLock className={classes.inputIcon} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="New Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={classes.input}
                                    required
                                    disabled={status === 'loading'}
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

                        <div className={classes.inputGroup}>
                            <div className={classes.inputWrapper}>
                                <FaLock className={classes.inputIcon} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={classes.input}
                                    required
                                    disabled={status === 'loading'}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={classes.submitButton}
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>

            {/* Background Decoration */}
            <div className={classes.backgroundPattern}></div>
        </div>
    );
}
