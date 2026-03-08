"use client";

import { useAuth, UserRole } from "@/lib/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({
    children,
    allowedRoles
}: {
    children: React.ReactNode,
    allowedRoles?: UserRole[]
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace("/login");
            } else if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
                // Redirect to their default dashboard if unauthorized for this specific route
                if (user.role === "admin") router.replace("/admin");
                else if (user.role === "kitchen") router.replace("/kds");
                else router.replace("/pos");
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, loading, router, allowedRoles]);

    if (loading || !isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
