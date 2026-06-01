import AuthGuard from '@/components/AuthGuard';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <section className="prof-section">
        <div className="bel-container">{children}</div>
      </section>
    </AuthGuard>
  );
}
