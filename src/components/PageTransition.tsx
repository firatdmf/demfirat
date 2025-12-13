'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Spinner from '@/components/Spinner';

export default function PageTransition() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 500); // 500ms görünür kalsın
        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    if (!loading) return null;

    return <Spinner />;
}
