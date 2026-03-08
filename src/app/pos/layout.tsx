import ProtectedRoute from "@/components/ProtectedRoute";

export default function POSLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={["admin", "manager", "cashier"]}>
            <div className="flex flex-col h-screen overflow-hidden bg-background">
                {/* POS Header */}
                <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
                    <h1 className="text-xl font-bold text-primary">RestoPOS</h1>
                    <div className="flex items-center gap-4">
                        {/* User Info & Actions */}
                    </div>
                </header>
                <main className="flex-1 overflow-hidden">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
