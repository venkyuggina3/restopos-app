"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { addTerminal, getCategories, getTerminals, updateTerminal } from "@/lib/firebase/services";
import { Category, Terminal } from "@/lib/types";
import { CheckCircle2, Loader2, MonitorSmartphone, Plus, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function TerminalsManagementPage() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form
    const [name, setName] = useState("");
    const [orderType, setOrderType] = useState<"dine-in" | "takeout" | "delivery">("dine-in");
    const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
    const [terminalId, setTerminalId] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [terms, cats] = await Promise.all([getTerminals(), getCategories()]);
            setTerminals(terms);
            setCategories(cats);
        } catch (error) {
            console.error("Error loading terminals", error);
        }
        setLoading(false);
    };

    const toggleHideCategory = (catId: string) => {
        if (hiddenCategories.includes(catId)) {
            setHiddenCategories(hiddenCategories.filter(id => id !== catId));
        } else {
            setHiddenCategories([...hiddenCategories, catId]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const finalId = terminalId.trim().toUpperCase() || `TER-${Math.floor(100 + Math.random() * 900)}`;
            await addTerminal({
                name,
                isActive: true,
                config: {
                    orderType,
                    hideCategories: hiddenCategories
                }
            });
            await fetchData();
            setIsModalOpen(false);
            // Reset form
            setName("");
            setOrderType("dine-in");
            setHiddenCategories([]);
            setTerminalId("");
        } catch (error) {
            console.error(error);
            alert("Failed to add terminal");
        }
        setIsSubmitting(false);
    };

    const toggleStatus = async (term: Terminal) => {
        await updateTerminal(term.id, { isActive: !term.isActive });
        fetchData();
    };

    if (loading || authLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Terminal Management</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
                >
                    <Plus className="w-4 h-4" /> Register New Terminal
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {terminals.map(term => (
                    <div key={term.id} className="bg-surface border border-border rounded-2xl p-6 shadow-lg flex flex-col relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <MonitorSmartphone className="w-24 h-24 text-primary" />
                        </div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold text-white">{term.name}</h3>
                                <p className="text-gray-400 font-mono text-sm mt-1">ID: {term.id}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${term.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {term.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {term.isActive ? "Online" : "Disabled"}
                            </span>
                        </div>

                        <div className="space-y-4 flex-1 relative z-10">
                            <div className="bg-background rounded-xl p-3 border border-border">
                                <span className="text-xs text-gray-500 block mb-1">Default Order Type</span>
                                <span className="text-white capitalize font-medium">{term.config.orderType}</span>
                            </div>

                            <div className="bg-background rounded-xl p-3 border border-border">
                                <span className="text-xs text-gray-500 block mb-1">Hidden Categories</span>
                                {term.config.hideCategories.length === 0 ? (
                                    <span className="text-gray-400 text-sm italic">None</span>
                                ) : (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {term.config.hideCategories.map(catId => {
                                            const c = categories.find(x => x.id === catId);
                                            return c ? <span key={catId} className="px-2 py-0.5 bg-surface border border-border text-xs text-gray-300 rounded-md">{c.name}</span> : null;
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-border flex justify-end relative z-10">
                            <button onClick={() => toggleStatus(term)} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                {term.isActive ? "Disable Terminal" : "Enable Terminal"}
                            </button>
                        </div>
                    </div>
                ))}

                {terminals.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-500 bg-surface rounded-2xl border border-border border-dashed">
                        <MonitorSmartphone className="w-12 h-12 mx-auto mb-4 opacity-50 text-gray-400" />
                        <h3 className="text-lg font-medium text-white mb-1">No Terminals Registered</h3>
                        <p>Create your first terminal profile to link physical devices.</p>
                    </div>
                )}
            </div>

            {/* Add Terminal Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-6">Register New Terminal</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Terminal Custom ID (Optional)</label>
                                <input type="text" placeholder="e.g. FRONT-1 or leave blank to auto-generate" value={terminalId} onChange={e => setTerminalId(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Descriptive Name</label>
                                <input required type="text" placeholder="e.g. Main Lobby Counter" value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Default Order Type</label>
                                <select required value={orderType} onChange={e => setOrderType(e.target.value as any)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none">
                                    <option value="dine-in">Dine-In</option>
                                    <option value="takeout">Takeout</option>
                                    <option value="delivery">Delivery</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">This terminal will pre-select this type for new orders.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Hide Categories (e.g. hide Bar Menu on Kitchen POS)</label>
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 bg-background p-3 rounded-xl border border-border">
                                    {categories.map(cat => (
                                        <label key={cat.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-surface rounded-lg transition-colors">
                                            <input
                                                type="checkbox"
                                                className="rounded text-primary focus:ring-primary bg-surface border-border accent-primary w-4 h-4"
                                                checked={hiddenCategories.includes(cat.id)}
                                                onChange={() => toggleHideCategory(cat.id)}
                                            />
                                            <span className="text-sm text-gray-300 select-none">{cat.name}</span>
                                        </label>
                                    ))}
                                    {categories.length === 0 && <span className="text-gray-500 text-sm italic col-span-2">No categories found.</span>}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-border mt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-background border border-border text-white rounded-xl hover:bg-border transition-colors font-medium">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-medium">{isSubmitting ? 'Saving...' : 'Register Terminal'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
