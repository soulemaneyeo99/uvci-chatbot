'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (requireAdmin && user?.role !== 'admin') {
                router.push('/'); // Redirect non-admins to home
            }
        }
    }, [user, isLoading, isAuthenticated, requireAdmin, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uvci-purple"></div>
            </div>
        );
    }

    if (!isAuthenticated || (requireAdmin && user?.role !== 'admin')) {
        return null;
    }

    return <>{children}</>;
}
