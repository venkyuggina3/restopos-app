import ProtectedRoute from "@/components/ProtectedRoute";

export default function KDSLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={["admin", "manager", "kitchen"]}>
            <div className="flex flex-col h-screen overflow-hidden bg-background">
                <header className="h-16 bg-surface border-b border-border flex items-center px-6">
                    <h1 className="text-xl font-bold text-orange-500">Kitchen Display System</h1>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
