export type Role = "admin" | "manager" | "cashier" | "kitchen";

export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    createdAt: number;
}

export interface Category {
    id: string;
    name: string;
    sortOrder: number;
    isActive: boolean;
}

export interface MenuItem {
    id: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    isAvailable: boolean;
    inventoryCount?: number;
}

export type OrderStatus = "saved" | "new" | "preparing" | "ready" | "completed" | "cancelled";

export interface OrderItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
}

export interface Order {
    id: string;
    orderNumber: number;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    createdAt: number;
    updatedAt: number;
    paymentMethod?: string;
    cashierId?: string;
    isGuest?: boolean;
    voidReason?: string;
    voidedBy?: string;
    terminalId?: string;
}

export interface Transaction {
    id: string;
    orderId: string;
    amount: number;
    paymentMethod: string; // "card" | "cash" | "qr"
    status: "pending" | "success" | "failed";
    timestamp: number;
}

export interface VoidReason {
    id: string;
    reason: string;
    isActive: boolean;
}

export interface Terminal {
    id: string;
    name: string;
    isActive: boolean;
    config: {
        orderType: "dine-in" | "takeout" | "delivery";
        hideCategories: string[]; // Array of Category IDs this terminal shouldn't show (e.g. Bar menu)
        receiptPrinter?: string;
    };
}
