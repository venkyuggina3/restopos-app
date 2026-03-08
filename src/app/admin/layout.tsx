import ProtectedRoute from "@/components/ProtectedRoute";
import { LayoutDashboard, Menu as MenuIcon } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <div className="flex h-screen overflow-hidden bg-background">
                <div className="w-64 bg-surface border-r border-border flex flex-col p-4">
                    <h2 className="text-xl font-bold text-primary mb-8 px-2">Admin Panel</h2>
                    <nav className="space-y-2 flex-1">
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-surface-hover rounded-xl transition-colors">
                            <LayoutDashboard className="w-5 h-5" /> Dashboard
                        </Link>
                        <Link href="/admin/menu" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-surface-hover rounded-xl transition-colors">
                            <MenuIcon className="w-5 h-5" /> Menu Management
                        </Link>
                    </nav>
                </div>
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
