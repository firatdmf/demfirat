"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import classes from './page.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message);
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong.');
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
                    <h1 className={classes.title}>Forgot Password?</h1>
                    <p className={classes.subtitle}>Enter your email to reset your password</p>
                </div>

                {/* Messages */}
                {status === 'success' && (
                    <div className={classes.successMessage}>
                        <p>{message}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className={classes.errorMessage}>
                        {message}
                    </div>
                )}

                {status === 'success' ? (
                    <div className={classes.footer}>
                        <Link href="/login" className={classes.backLink}>
                            ← Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={classes.form}>
                        <div className={classes.inputGroup}>
                            <div className={classes.inputWrapper}>
                                <FaEnvelope className={classes.inputIcon} />
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <div className={classes.footer}>
                            <Link href="/login" className={classes.backLink}>
                                ← Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>

            {/* Background Decoration */}
            <div className={classes.backgroundPattern}></div>
        </div>
    );
}
