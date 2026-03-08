import { collection, doc, getDocs, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { Category, MenuItem, Order } from "../types";
import { db } from "./config";

// CATEGORIES
export async function getCategories(): Promise<Category[]> {
    const q = query(collection(db, "categories"), orderBy("sortOrder", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function addCategory(category: Omit<Category, "id">) {
    const newRef = doc(collection(db, "categories"));
    await setDoc(newRef, { ...category, id: newRef.id });
    return newRef.id;
}

export async function updateCategory(id: string, updates: Partial<Category>) {
    await updateDoc(doc(db, "categories", id), updates);
}

// MENU ITEMS
export async function getMenuItems(categoryId?: string): Promise<MenuItem[]> {
    let q = collection(db, "menu_items") as any;
    if (categoryId) {
        q = query(q, where("categoryId", "==", categoryId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as MenuItem));
}

export async function addMenuItem(item: Omit<MenuItem, "id">) {
    const newRef = doc(collection(db, "menu_items"));
    await setDoc(newRef, { ...item, id: newRef.id });
    return newRef.id;
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>) {
    await updateDoc(doc(db, "menu_items", id), updates);
}

// ORDERS
export async function createOrder(order: Omit<Order, "id" | "createdAt" | "updatedAt">) {
    const newRef = doc(collection(db, "orders"));
    const now = Date.now();
    await setDoc(newRef, { ...order, id: newRef.id, createdAt: now, updatedAt: now });
    return newRef.id;
}

export async function updateOrderStatus(id: string, status: Order["status"], paymentMethod?: string) {
    const data: any = { status, updatedAt: Date.now() };
    if (paymentMethod) data.paymentMethod = paymentMethod;
    await updateDoc(doc(db, "orders", id), data);
}

export async function updateOrder(id: string, orderUpdates: Partial<Order>) {
    await updateDoc(doc(db, "orders", id), { ...orderUpdates, updatedAt: Date.now() });
}

export async function getSavedOrders(): Promise<Order[]> {
    const q = query(collection(db, "orders"), where("status", "==", "saved"), orderBy("updatedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Order));
}

// VOID REASONS
export async function getVoidReasons(): Promise<any[]> {
    const q = query(collection(db, "void_reasons"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addVoidReason(reason: string) {
    const newRef = doc(collection(db, "void_reasons"));
    await setDoc(newRef, { id: newRef.id, reason, isActive: true });
    return newRef.id;
}

export async function updateVoidReason(id: string, isActive: boolean) {
    await updateDoc(doc(db, "void_reasons", id), { isActive });
}
