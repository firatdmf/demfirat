
import crypto from 'crypto';

/**
 * Hashes a password using PBKDF2-SHA256, compatible with Django.
 * Format: pbkdf2_sha256$iterations$salt$hash
 */
export function hashPassword(password: string): string {
    const iterations = 600000; // Django 4.x default, adjust if needed (e.g. 216000 for older versions)
    const salt = crypto.randomBytes(12).toString('base64');
    const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('base64');
    return `pbkdf2_sha256$${iterations}$${salt}$${hash}`;
}

/**
 * Verifies a password against a Django PBKDF2-SHA256 hash.
 */
export function verifyPassword(password: string, djangoHash: string): boolean {
    const parts = djangoHash.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2_sha256') {
        return false;
    }

    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const originalHash = parts[3];

    const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('base64');
    return hash === originalHash;
}
