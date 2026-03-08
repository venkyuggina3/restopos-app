"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { Order, User } from "@/lib/types";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { Loader2, SearchX } from "lucide-react";
import { useEffect, useState } from "react";

export default function VoidedChecksReport() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [voidedChecks, setVoidedChecks] = useState<Order[]>([]);
    const [usersMap, setUsersMap] = useState<Record<string, User>>({});

    useEffect(() => {
        const fetchVoided = async () => {
            setLoading(true);
            try {
                // Fetch all users to map voidedBy (uid) -> name
                const usersSnap = await getDocs(collection(db, "users"));
                const usersData: Record<string, User> = {};
                usersSnap.docs.forEach(doc => {
                    usersData[doc.id] = doc.data() as User;
                });
                setUsersMap(usersData);

                // Fetch cancelled orders
                const q = query(
                    collection(db, "orders"),
                    where("status", "==", "cancelled"),
                    orderBy("updatedAt", "desc")
                );
                const snapshot = await getDocs(q);
                const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
                setVoidedChecks(orders);

            } catch (error: any) {
                console.error("Failed to load voided checks", error);
                alert("Database Error: " + error.message + "\n\nPlease open the Browser Console (F12) and click the Firebase link to generate the Index if requested.");
            }
            setLoading(false);
        };

        if (!authLoading && user) {
            fetchVoided();
        }
    }, [user, authLoading]);

    if (loading || authLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Voided Checks Report</h1>
            </div>

            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-lg">
                <div className="p-4 border-b border-border bg-background">
                    <h2 className="text-xl font-bold text-white px-2">Recent Voids</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-background border-b border-border text-gray-400 text-sm">
                            <tr>
                                <th className="p-4 font-medium">Order #</th>
                                <th className="p-4 font-medium">Date / Time</th>
                                <th className="p-4 font-medium">Items</th>
                                <th className="p-4 font-medium">Total Value</th>
                                <th className="p-4 font-medium">Void Reason</th>
                                <th className="p-4 font-medium">Voided By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {voidedChecks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-500">
                                        <SearchX className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <p>No voided checks found in the database.</p>
                                    </td>
                                </tr>
                            ) : (
                                voidedChecks.map(order => {
                                    const voidUser = order.voidedBy ? usersMap[order.voidedBy] : null;
                                    const userName = voidUser?.name || voidUser?.email || order.voidedBy || "Unknown";

                                    return (
                                        <tr key={order.id} className="hover:bg-background/50 transition-colors">
                                            <td className="p-4 text-white font-bold">#{order.orderNumber}</td>
                                            <td className="p-4 text-gray-400">
                                                {new Date(order.updatedAt).toLocaleDateString()} <br />
                                                <span className="text-xs">{new Date(order.updatedAt).toLocaleTimeString()}</span>
                                            </td>
                                            <td className="p-4 text-gray-300 text-sm max-w-xs truncate">
                                                {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                            </td>
                                            <td className="p-4 text-primary font-mono">${order.total.toFixed(2)}</td>
                                            <td className="p-4">
                                                <span className="inline-flex py-1 px-3 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-medium whitespace-nowrap">
                                                    {order.voidReason || "No Reason Specified"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-300">{userName}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
