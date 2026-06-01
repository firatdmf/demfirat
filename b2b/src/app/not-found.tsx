import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="tr">
      <body style={{ background: '#FAF8F4', color: '#0E0E0C', padding: 80, fontFamily: 'system-ui' }}>
        <h1 style={{ fontSize: 64, fontWeight: 300 }}>404</h1>
        <p style={{ marginTop: 16 }}>Sayfa bulunamadı.</p>
        <Link href="/" style={{ marginTop: 24, display: 'inline-block', textDecoration: 'underline' }}>
          ← Ana sayfaya dön
        </Link>
      </body>
    </html>
  );
}
