"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { createOrder, getCategories, getMenuItems, getSavedOrders, updateOrder } from "@/lib/firebase/services";
import { Category, MenuItem, Order, OrderItem } from "@/lib/types";
import { Banknote, Bookmark, ChevronRight, CreditCard, Layers, Loader2, Minus, Plus, QrCode, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

export default function POSPage() {
    const { user, logout } = useAuth();

    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [savedChecks, setSavedChecks] = useState<Order[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [cart, setCart] = useState<OrderItem[]>([]);
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
    const [currentOrderNumber, setCurrentOrderNumber] = useState<number | null>(null);

    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [tenderModalOpen, setTenderModalOpen] = useState(false);
    const [savedChecksModalOpen, setSavedChecksModalOpen] = useState(false);
    const [activeCartIndex, setActiveCartIndex] = useState<number | null>(null);
    const [tempNote, setTempNote] = useState("");

    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const cats = await getCategories();
                const its = await getMenuItems();
                setCategories(cats);
                setItems(its);
                if (cats.length > 0) setActiveCategory(cats[0].id);
            } catch (error) {
                console.error("Error loading POS data:", error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const fetchSavedChecks = async () => {
        setIsProcessing(true);
        try {
            const checks = await getSavedOrders();
            setSavedChecks(checks);
            setSavedChecksModalOpen(true);
        } catch (e) {
            console.error(e);
        }
        setIsProcessing(false);
    };

    const recallCheck = (order: Order) => {
        setCart(order.items);
        setCurrentOrderId(order.id);
        setCurrentOrderNumber(order.orderNumber);
        setSavedChecksModalOpen(false);
    };

    const displayedItems = activeCategory ? items.filter(i => i.categoryId === activeCategory && i.isAvailable) : [];

    const addToCart = (item: MenuItem) => {
        const existingIndex = cart.findIndex(c => c.menuItemId === item.id);
        if (existingIndex >= 0) {
            const newCart = [...cart];
            newCart[existingIndex].quantity += 1;
            setCart(newCart);
        } else {
            setCart([...cart, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1, notes: "" }]);
        }
    };

    const updateQuantity = (index: number, delta: number) => {
        const newCart = [...cart];
        newCart[index].quantity += delta;
        if (newCart[index].quantity <= 0) {
            newCart.splice(index, 1);
        }
        setCart(newCart);
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08; // 8% Default Tax
    const total = subtotal + tax;

    const handleSaveCheck = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        try {
            if (currentOrderId) {
                await updateOrder(currentOrderId, {
                    items: cart,
                    subtotal,
                    tax,
                    total
                });
            } else {
                await createOrder({
                    orderNumber: Math.floor(1000 + Math.random() * 9000),
                    status: "saved",
                    items: cart,
                    subtotal,
                    tax,
                    total,
                    cashierId: user?.uid,
                });
            }
            setCart([]);
            setCurrentOrderId(null);
            setCurrentOrderNumber(null);
        } catch (e) {
            console.error(e);
            alert("Failed to save check");
        }
        setIsProcessing(false);
    };

    const handlePayment = async (method: string) => {
        setIsProcessing(true);
        try {
            if (currentOrderId) {
                await updateOrder(currentOrderId, {
                    items: cart,
                    subtotal,
                    tax,
                    total,
                    status: "new",
                    paymentMethod: method
                });
            } else {
                await createOrder({
                    orderNumber: Math.floor(1000 + Math.random() * 9000),
                    status: "new",
                    items: cart,
                    subtotal,
                    tax,
                    total,
                    cashierId: user?.uid,
                    paymentMethod: method
                });
            }
            setCart([]);
            setCurrentOrderId(null);
            setCurrentOrderNumber(null);
            setTenderModalOpen(false);
            alert(`Order sent to kitchen! (Paid with ${method})`);
        } catch (error) {
            console.error(error);
            alert("Failed to process payment");
        }
        setIsProcessing(false);
    };

    if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="h-full flex overflow-hidden">
            {/* Menu Area */}
            <div className="flex-1 flex flex-col bg-background">
                {/* Category Tabs */}
                <div className="h-20 border-b border-border bg-surface flex items-center justify-between px-4 shadow-sm relative">
                    <div className="flex overflow-x-auto gap-2 no-scrollbar pl-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-xl whitespace-nowrap font-medium transition-colors ${activeCategory === cat.id ? 'bg-primary text-white shadow-md' : 'bg-background hover:bg-surface-hover text-gray-300'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Item Grid */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start">
                    {displayedItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => addToCart(item)}
                            className="bg-surface border border-border rounded-2xl p-4 flex flex-col hover:border-primary/50 hover:shadow-lg transition-all text-left group active:scale-95"
                        >
                            <div className="w-full aspect-video bg-background rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                                {/* Placeholder for image */}
                                <div className="w-12 h-12 rounded-full border-4 border-dashed border-border group-hover:border-primary/50 transition-colors" />
                            </div>
                            <h3 className="font-semibold text-white truncate w-full text-lg">{item.name}</h3>
                            <p className="text-primary font-bold mt-1 text-xl">${item.price.toFixed(2)}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Cart Area */}
            <div className="w-96 flex-shrink-0 bg-surface border-l border-border flex flex-col shadow-2xl relative z-10 transition-transform">
                <div className="p-4 border-b border-border bg-background">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                                <h3 className="text-white font-medium text-sm leading-none truncate max-w-[120px]">{user?.name || user?.email}</h3>
                                <p className="text-gray-400 text-xs mt-1 capitalize">{user?.role || "Staff"}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={fetchSavedChecks} className="p-2 border border-border bg-surface hover:bg-surface-hover text-gray-300 rounded-lg transition-colors" title="Saved Checks">
                                <Layers className="w-4 h-4" />
                            </button>
                            <button onClick={logout} className="text-xs px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 font-medium transition-colors">Sign Out</button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-surface p-3 rounded-xl border border-border">
                        <div className="text-sm font-medium text-white">Current Check</div>
                        <div className="text-xs font-mono text-gray-400 bg-background px-2 py-1 rounded">
                            {currentOrderNumber ? `#${currentOrderNumber}` : cart.length > 0 ? "InProgress" : "New Order"}
                        </div>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                            <ShoppingCart className="w-12 h-12 opacity-20" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={index} className="bg-background border border-border rounded-xl p-3 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 pr-2">
                                        <h4 className="text-white font-medium">{item.name}</h4>
                                        <p className="text-primary font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-surface rounded-lg p-1 border border-border">
                                        <button onClick={() => updateQuantity(index, -1)} className="w-8 h-8 flex items-center justify-center rounded-md bg-transparent hover:bg-border text-white">
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-6 text-center text-white font-medium">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(index, 1)} className="w-8 h-8 flex items-center justify-center rounded-md bg-primary hover:bg-primary-hover text-white">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-border">
                                    <button
                                        onClick={() => { setActiveCartIndex(index); setTempNote(item.notes || ""); setNotesModalOpen(true); }}
                                        className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-surface border border-border"
                                    >
                                        {item.notes ? "Edit Note" : "+ Add Note"}
                                    </button>
                                    {item.notes && <span className="text-xs text-primary truncate max-w-[120px]">{item.notes}</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Totals & Checkout */}
                <div className="bg-background border-t border-border p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
                    <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between text-gray-400 text-sm">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400 text-sm">
                            <span>Tax (8%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white text-xl font-bold pt-2 border-t border-border mt-2">
                            <span>Total</span>
                            <span className="text-primary">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            disabled={cart.length === 0 || isProcessing}
                            onClick={handleSaveCheck}
                            className="bg-surface hover:bg-surface-hover disabled:opacity-50 border border-border text-white px-4 rounded-xl flex items-center justify-center transition-colors"
                            title="Save Order for Later"
                        >
                            <Bookmark className="w-5 h-5" />
                        </button>
                        <button
                            disabled={cart.length === 0 || isProcessing}
                            onClick={() => setTenderModalOpen(true)}
                            className="flex-1 bg-primary hover:bg-primary-hover disabled:bg-surface disabled:text-gray-500 disabled:border-border border border-transparent text-white text-lg font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-primary/20 shadow-lg"
                        >
                            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                <>Pay & Send <ChevronRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Notes Modal */}
            {notesModalOpen && activeCartIndex !== null && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">Special Instructions</h3>
                        <textarea
                            value={tempNote}
                            onChange={e => setTempNote(e.target.value)}
                            placeholder="e.g. No onions, extra spicy..."
                            className="w-full bg-background border border-border rounded-xl p-4 text-white focus:ring-1 focus:ring-primary outline-none resize-none h-32 mb-6"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setNotesModalOpen(false)}
                                className="flex-1 py-3 bg-background border border-border text-white rounded-xl hover:bg-border transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const newCart = [...cart];
                                    newCart[activeCartIndex].notes = tempNote;
                                    setCart(newCart);
                                    setNotesModalOpen(false);
                                }}
                                className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-medium"
                            >
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tender Modal */}
            {tenderModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Select Payment</h2>
                            <p className="text-2xl font-bold text-primary">${total.toFixed(2)}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 mb-6">
                            <button onClick={() => handlePayment("Credit Card")} className="flex items-center gap-4 bg-background border border-border hover:border-primary p-4 rounded-xl text-white font-medium transition-colors">
                                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><CreditCard className="w-6 h-6" /></div>
                                Credit / Debit Card
                            </button>
                            <button onClick={() => handlePayment("Cash")} className="flex items-center gap-4 bg-background border border-border hover:border-primary p-4 rounded-xl text-white font-medium transition-colors">
                                <div className="p-2 bg-green-500/10 text-green-500 rounded-lg"><Banknote className="w-6 h-6" /></div>
                                Cash
                            </button>
                            <button onClick={() => handlePayment("UPI")} className="flex items-center gap-4 bg-background border border-border hover:border-primary p-4 rounded-xl text-white font-medium transition-colors">
                                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><QrCode className="w-6 h-6" /></div>
                                UPI / Digital
                            </button>
                        </div>

                        <button onClick={() => setTenderModalOpen(false)} className="py-3 font-medium text-gray-400 hover:text-white transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Saved Checks Modal */}
            {savedChecksModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-background">
                            <h2 className="text-xl font-bold text-white">Saved Checks</h2>
                            <button onClick={() => setSavedChecksModalOpen(false)} className="text-gray-400 hover:text-white">Close</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {savedChecks.length === 0 ? (
                                <div className="py-12 text-center text-gray-500">No saved checks found.</div>
                            ) : (
                                savedChecks.map(order => (
                                    <div key={order.id} className="flex justify-between items-center p-4 bg-background border border-border rounded-xl">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-white text-lg">#{order.orderNumber}</h3>
                                                <span className="text-xs bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded">Saved</span>
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1">{order.items.length} items • Last updated {new Date(order.updatedAt).toLocaleTimeString()}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xl font-bold text-primary">${order.total.toFixed(2)}</span>
                                            <button
                                                onClick={() => recallCheck(order)}
                                                className="px-4 py-2 bg-surface border border-border hover:bg-primary hover:text-white hover:border-primary text-gray-300 font-medium rounded-lg transition-colors"
                                            >
                                                Recall
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
