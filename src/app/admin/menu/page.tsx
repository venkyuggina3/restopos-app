"use client";

import { addCategory, addMenuItem, getCategories, getMenuItems, updateMenuItem } from "@/lib/firebase/services";
import { Category, MenuItem } from "@/lib/types";
import { Edit2, Image as ImageIcon, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function MenuManagementPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<"categories" | "items">("items");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [newItemName, setNewItemName] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");
    const [newItemCategory, setNewItemCategory] = useState("");
    const [newItemDesc, setNewItemDesc] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const cats = await getCategories();
            const its = await getMenuItems();
            setCategories(cats);
            setItems(its);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setLoading(false);
    };

    const handleCreateCategory = async () => {
        if (!newItemName) return;
        await addCategory({ name: newItemName, sortOrder: categories.length, isActive: true });
        setNewItemName("");
        setIsModalOpen(false);
        fetchData();
    };

    const handleCreateItem = async () => {
        if (!newItemName || !newItemPrice || !newItemCategory) return;
        await addMenuItem({
            name: newItemName,
            price: parseFloat(newItemPrice),
            categoryId: newItemCategory,
            description: newItemDesc,
            isAvailable: true,
            imageUrl: ""
        });
        setNewItemName("");
        setNewItemPrice("");
        setNewItemCategory("");
        setNewItemDesc("");
        setIsModalOpen(false);
        fetchData();
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Menu Management</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" /> Add {activeTab === "categories" ? "Category" : "Menu Item"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-border mb-6">
                <button
                    className={`pb-3 font-medium transition-colors ${activeTab === "items" ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-white"}`}
                    onClick={() => setActiveTab("items")}
                >
                    Menu Items
                </button>
                <button
                    className={`pb-3 font-medium transition-colors ${activeTab === "categories" ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-white"}`}
                    onClick={() => setActiveTab("categories")}
                >
                    Categories
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === "categories" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map(cat => (
                            <div key={cat.id} className="bg-surface border border-border rounded-xl p-4 flex justify-between items-center">
                                <span className="text-white font-medium">{cat.name}</span>
                                <div className="flex gap-2">
                                    <button className="p-2 text-gray-400 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                        {categories.length === 0 && <div className="col-span-full py-8 text-center text-gray-500">No categories found</div>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {items.map(item => (
                            <div key={item.id} className="bg-surface border border-border rounded-xl p-4 flex gap-4">
                                <div className="w-20 h-20 bg-background rounded-lg flex items-center justify-center flex-shrink-0">
                                    <ImageIcon className="w-8 h-8 text-border" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-white font-medium">{item.name}</h3>
                                        <span className="text-primary font-bold">${item.price.toFixed(2)}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={async () => {
                                                await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
                                                fetchData();
                                            }}
                                            className={`text-xs px-2 py-1 rounded-full border ${item.isAvailable ? 'border-green-500/30 text-green-500' : 'border-red-500/30 text-red-500'}`}
                                        >
                                            {item.isAvailable ? 'Available' : 'Unavailable'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && <div className="col-span-full py-8 text-center text-gray-500">No menu items found</div>}
                    </div>
                )}
            </div>

            {/* Basic Modal Implementation */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">Add {activeTab === "categories" ? "Category" : "Menu Item"}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                                />
                            </div>

                            {activeTab === "items" && (
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Price</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={newItemPrice}
                                            onChange={e => setNewItemPrice(e.target.value)}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Category</label>
                                        <select
                                            value={newItemCategory}
                                            onChange={e => setNewItemCategory(e.target.value)}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Description</label>
                                        <textarea
                                            value={newItemDesc}
                                            onChange={e => setNewItemDesc(e.target.value)}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                                            rows={3}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={activeTab === "categories" ? handleCreateCategory : handleCreateItem}
                                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl transition-colors font-medium"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
