"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { addCategory, addMenuItem, addVoidReason, getCategories, getMenuItems, getVoidReasons, updateCategory, updateMenuItem, updateVoidReason } from "@/lib/firebase/services";
import { Category, MenuItem } from "@/lib/types";
import { CheckCircle2, Loader2, Plus, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MenuManagementPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"items" | "categories" | "voids">("items");

    // Data
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [voidReasons, setVoidReasons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [categoryForm, setCategoryForm] = useState({ name: "", sortOrder: 0 });
    const [itemForm, setItemForm] = useState({ name: "", description: "", price: 0, categoryId: "", isAvailable: true });
    const [voidForm, setVoidForm] = useState({ reason: "" });

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
        if (!authLoading && user && user.role !== 'admin' && user.role !== 'manager') router.push('/');
    }, [user, authLoading, router]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const cats = await getCategories();
            const its = await getMenuItems();
            const voids = await getVoidReasons();
            setCategories(cats);
            setItems(its);
            setVoidReasons(voids);
            if (cats.length > 0 && !itemForm.categoryId) {
                setItemForm(prev => ({ ...prev, categoryId: cats[0].id }));
            }
        } catch (error) {
            console.error("Error loading data:", error);
        }
        setLoading(false);
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addCategory({ ...categoryForm, isActive: true });
            await fetchData();
            setIsCategoryModalOpen(false);
            setCategoryForm({ name: "", sortOrder: categories.length });
        } catch (error) {
            console.error(error);
            alert("Failed to add category");
        }
        setIsSubmitting(false);
    };

    const handleItemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addMenuItem(itemForm);
            await fetchData();
            setIsItemModalOpen(false);
            setItemForm({ name: "", description: "", price: 0, categoryId: categories[0]?.id || "", isAvailable: true });
        } catch (error) {
            console.error(error);
            alert("Failed to add item");
        }
        setIsSubmitting(false);
    };

    const handleVoidSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addVoidReason(voidForm.reason);
            await fetchData();
            setIsVoidModalOpen(false);
            setVoidForm({ reason: "" });
        } catch (error) {
            console.error(error);
            alert("Failed to add void reason");
        }
        setIsSubmitting(false);
    };

    const toggleCategoryStatus = async (cat: Category) => {
        await updateCategory(cat.id, { isActive: !cat.isActive });
        fetchData();
    };

    const toggleItemStatus = async (item: MenuItem) => {
        await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
        fetchData();
    };

    const toggleVoidStatus = async (vr: any) => {
        await updateVoidReason(vr.id, !vr.isActive);
        fetchData();
    };

    if (loading || authLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Menu Management</h1>
                <div className="flex bg-surface rounded-xl p-1 border border-border">
                    <button
                        onClick={() => setActiveTab("items")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'items' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                        Menu Items
                    </button>
                    <button
                        onClick={() => setActiveTab("categories")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'categories' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                        Categories
                    </button>
                    <button
                        onClick={() => setActiveTab("voids")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'voids' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                        Void Reasons
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center bg-background">
                    <h2 className="text-xl font-bold text-white px-2">
                        {activeTab === 'items' ? 'Menu Items' : activeTab === 'categories' ? 'Categories' : 'Void Reasons'}
                    </h2>
                    <button
                        onClick={() => {
                            if (activeTab === 'items') setIsItemModalOpen(true);
                            else if (activeTab === 'categories') setIsCategoryModalOpen(true);
                            else setIsVoidModalOpen(true);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-colors ${activeTab === 'voids' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-hover'}`}
                    >
                        <Plus className="w-4 h-4" /> Add New
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {activeTab === 'categories' && (
                        <table className="w-full text-left">
                            <thead className="bg-background border-b border-border text-gray-400 text-sm">
                                <tr>
                                    <th className="p-4 font-medium">Name</th>
                                    <th className="p-4 font-medium">Sort Order</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {categories.map(cat => (
                                    <tr key={cat.id} className="hover:bg-background/50 transition-colors">
                                        <td className="p-4 text-white font-medium">{cat.name}</td>
                                        <td className="p-4 text-gray-400">{cat.sortOrder}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                {cat.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {cat.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => toggleCategoryStatus(cat)} className="text-sm text-primary hover:text-white transition-colors">
                                                Toggle Status
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">No categories found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'items' && (
                        <table className="w-full text-left">
                            <thead className="bg-background border-b border-border text-gray-400 text-sm">
                                <tr>
                                    <th className="p-4 font-medium">Name</th>
                                    <th className="p-4 font-medium">Category</th>
                                    <th className="p-4 font-medium">Price</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-background/50 transition-colors">
                                        <td className="p-4 text-white font-medium">
                                            {item.name}
                                            <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{item.description}</p>
                                        </td>
                                        <td className="p-4 text-gray-400">{categories.find(c => c.id === item.categoryId)?.name || 'Unknown'}</td>
                                        <td className="p-4 text-white font-mono">${item.price.toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${item.isAvailable ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                {item.isAvailable ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {item.isAvailable ? "Available" : "Sold Out"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => toggleItemStatus(item)} className="text-sm text-primary hover:text-white transition-colors">
                                                Toggle Status
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No items found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'voids' && (
                        <table className="w-full text-left">
                            <thead className="bg-background border-b border-border text-gray-400 text-sm">
                                <tr>
                                    <th className="p-4 font-medium">Void Reason</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {voidReasons.map(vr => (
                                    <tr key={vr.id} className="hover:bg-background/50 transition-colors">
                                        <td className="p-4 text-white font-medium">{vr.reason}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${vr.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                {vr.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {vr.isActive ? "Active" : "Disabled"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => toggleVoidStatus(vr)} className="text-sm text-red-400 hover:text-white transition-colors">
                                                Toggle Status
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {voidReasons.length === 0 && (
                                    <tr><td colSpan={3} className="p-8 text-center text-gray-500">No void reasons found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-6">Add New Category</h2>
                        <form onSubmit={handleCategorySubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Category Name</label>
                                <input required type="text" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Sort Order (0 is first)</label>
                                <input required type="number" value={categoryForm.sortOrder} onChange={e => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-border mt-6">
                                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="flex-1 py-3 bg-background border border-border text-white rounded-xl hover:bg-border transition-colors font-medium">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-medium">{isSubmitting ? 'Saving...' : 'Save Category'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isItemModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl h-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-6">Add Menu Item</h2>
                        <form onSubmit={handleItemSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Item Name</label>
                                <input required type="text" value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                                <select required value={itemForm.categoryId} onChange={e => setItemForm({ ...itemForm, categoryId: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none">
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Price ($)</label>
                                <input required type="number" step="0.01" value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: parseFloat(e.target.value) })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none h-24 resize-none" />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-border mt-6">
                                <button type="button" onClick={() => setIsItemModalOpen(false)} className="flex-1 py-3 bg-background border border-border text-white rounded-xl hover:bg-border transition-colors font-medium">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-medium">{isSubmitting ? 'Saving...' : 'Save Item'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isVoidModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-6 text-red-500">Add Void Reason</h2>
                        <form onSubmit={handleVoidSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Predefined Reason</label>
                                <input required type="text" placeholder="e.g. Guest Changed Mind, Spilled, Not Made..." value={voidForm.reason} onChange={e => setVoidForm({ reason: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-red-500 outline-none" />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-border mt-6">
                                <button type="button" onClick={() => setIsVoidModalOpen(false)} className="flex-1 py-3 bg-background border border-border text-white rounded-xl hover:bg-border transition-colors font-medium">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium">{isSubmitting ? 'Saving...' : 'Add Reason'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
