"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { updateOrderStatus } from "@/lib/firebase/services";
import { Order } from "@/lib/types";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function KDSPage() {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to all active orders
        const q = query(
            collection(db, "orders"),
            where("status", "in", ["new", "preparing", "ready"]),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const updatedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setOrders(updatedOrders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
        const nextStatus = currentStatus === "new" ? "preparing" : currentStatus === "preparing" ? "ready" : "completed";
        await updateOrderStatus(orderId, nextStatus as Order["status"]);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "new": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
            case "preparing": return "bg-orange-500/20 text-orange-400 border-orange-500/50";
            case "ready": return "bg-green-500/20 text-green-400 border-green-500/50";
            default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
        }
    };

    if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Kitchen Display System</h2>
                <div className="flex gap-4 items-center">
                    <span className="text-sm text-gray-400">Total Active: {orders.length}</span>
                    <button
                        onClick={logout}
                        className="px-4 py-2 border border-border text-gray-300 hover:bg-surface-hover rounded-lg transition-colors text-sm"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto pb-4 no-scrollbar">
                <div className="flex gap-6 h-full items-start w-max">
                    {orders.length === 0 ? (
                        <div className="w-full flex justify-center pt-20">
                            <p className="text-gray-500 text-lg">No active orders in the kitchen. Great job!</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="w-80 flex-shrink-0 bg-surface border border-border rounded-xl flex flex-col shadow-lg overflow-hidden h-max max-h-full">
                                {/* Header */}
                                <div className={`p-4 border-b border-border flex justify-between items-center ${order.status === 'new' ? 'bg-blue-500/10' : order.status === 'preparing' ? 'bg-orange-500/10' : 'bg-green-500/10'}`}>
                                    <div>
                                        <span className="text-2xl font-bold text-white">#{order.orderNumber}</span>
                                        <div className={`text-xs px-2 py-0.5 mt-1 rounded uppercase font-bold border inline-block ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </div>
                                    </div>
                                    <div className="flex items-center text-gray-400 text-sm gap-1">
                                        <Clock className="w-4 h-4" />
                                        {Math.round((Date.now() - order.createdAt) / 60000)}m
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 text-white border-b border-border/50 pb-3 last:border-0 last:pb-0">
                                            <div className="font-bold text-lg w-6">{item.quantity}x</div>
                                            <div className="flex-1">
                                                <div className="font-medium text-lg">{item.name}</div>
                                                {item.notes && (
                                                    <div className="text-red-400 text-sm font-medium bg-red-500/10 px-2 py-1 rounded mt-1 border border-red-500/20">
                                                        *** {item.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer Action */}
                                <div className="p-4 bg-background border-t border-border">
                                    <button
                                        onClick={() => handleUpdateStatus(order.id, order.status)}
                                        className={`w-full py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 ${order.status === "new" ? "bg-orange-500 hover:bg-orange-600 text-white" :
                                                order.status === "preparing" ? "bg-green-500 hover:bg-green-600 text-white" :
                                                    "bg-gray-700 hover:bg-gray-600 text-white"
                                            }`}
                                    >
                                        {order.status === "new" ? "Start Preparing" : order.status === "preparing" ? "Mark Ready" : <><CheckCircle2 /> Complete Order</>}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
