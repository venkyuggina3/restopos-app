import ProtectedRoute from "@/components/ProtectedRoute";
import { LayoutDashboard, Menu as MenuIcon, MonitorSmartphone } from "lucide-react";
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
                        <Link href="/admin/terminals" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-surface-hover rounded-xl transition-colors">
                            <MonitorSmartphone className="w-5 h-5" /> Terminals
                        </Link>
                        <Link href="/admin/menu" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-surface-hover rounded-xl transition-colors">
                            <MenuIcon className="w-5 h-5" /> Menu Management
                        </Link>
                        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reports</div>
                        <Link href="/admin/reports/voids" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-surface-hover rounded-xl transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Voided Checks
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
