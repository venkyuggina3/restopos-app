"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { Order } from "@/lib/types";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { CreditCard, DollarSign, Loader2, ShoppingBag, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        avgValue: 0,
        pmix: [] as { name: string, qty: number, revenue: number }[]
    });

    useEffect(() => {
        const fetchStats = async () => {
            // Get today's start and end timestamps
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            try {
                const q = query(
                    collection(db, "orders"),
                    where("createdAt", ">=", startOfDay.getTime()),
                    orderBy("createdAt", "desc")
                );
                const snapshot = await getDocs(q);
                const orders = snapshot.docs.map(doc => doc.data() as Order);

                // Calculate
                let totalSales = 0;
                let pmixMap = new Map<string, { qty: number, revenue: number }>();

                orders.forEach(o => {
                    totalSales += o.total;
                    o.items.forEach(item => {
                        const current = pmixMap.get(item.menuItemId) || { qty: 0, revenue: 0 };
                        pmixMap.set(item.menuItemId, {
                            qty: current.qty + item.quantity,
                            revenue: current.revenue + (item.price * item.quantity)
                        });
                    });
                });

                // Sort PMIX
                const pmix = Array.from(pmixMap.entries()).map(([_, { qty, revenue }]) => {
                    const name = orders.flatMap(o => o.items).find(i => i.menuItemId === _)?.name || "Unknown";
                    return { name, qty, revenue };
                }).sort((a, b) => b.qty - a.qty).slice(0, 5); // Top 5

                setStats({
                    totalSales,
                    totalOrders: orders.length,
                    avgValue: orders.length > 0 ? totalSales / orders.length : 0,
                    pmix
                });
            } catch (error) {
                console.error("Failed to load stats", error);
            }
            setLoading(false);
        };

        fetchStats();
    }, []);

    if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">Welcome, {user?.name || user?.email}</span>
                    <button
                        onClick={logout}
                        className="px-4 py-2 border border-border text-gray-300 hover:text-white hover:bg-surface-hover rounded-xl transition-colors text-sm"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-20 h-20 text-green-500" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Today's Sales</h3>
                    <p className="text-4xl font-bold text-white mt-4">${stats.totalSales.toFixed(2)}</p>
                </div>

                <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShoppingBag className="w-20 h-20 text-blue-500" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Total Orders</h3>
                    <p className="text-4xl font-bold text-white mt-4">{stats.totalOrders}</p>
                </div>

                <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard className="w-20 h-20 text-purple-500" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Average Value</h3>
                    <p className="text-4xl font-bold text-white mt-4">${stats.avgValue.toFixed(2)}</p>
                </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-6">Product Mix (Top 5 Today)</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border text-gray-400 text-sm">
                                <th className="py-3 font-medium">Item Name</th>
                                <th className="py-3 font-medium">Quantity Sold</th>
                                <th className="py-3 font-medium">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.pmix.length === 0 ? (
                                <tr><td colSpan={3} className="py-8 text-center text-gray-500">No sales data found for today</td></tr>
                            ) : (
                                stats.pmix.map((item, idx) => (
                                    <tr key={idx} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                                        <td className="py-4 text-white font-medium">{item.name}</td>
                                        <td className="py-4 text-gray-300">{item.qty} units</td>
                                        <td className="py-4 text-primary font-bold">${item.revenue.toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
