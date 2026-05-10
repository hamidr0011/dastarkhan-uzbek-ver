import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [specialRequest, setSpecialRequest] = useState('');

    const addToCart = (item, quantity, specialInstructions) => {
        setCartItems(prevItems => {
            // Check if item already exists with SAME special instructions (if we were being very complex), 
            // but for simple MVP, maybe just separate entries per add or group by ID.
            // Instructions say: "If item unavailable...".
            // Let's standardly group by itemId. 
            // But if special instructions differ, it should be a new line item. 
            // For MVP simplicity, let's treat every 'add' as a unique line item or group by ID if possible.
            // Let's try to find existing item with same ID.
            const existingItemIndex = prevItems.findIndex(i => i.id === item.id);

            if (existingItemIndex > -1) {
                // If found, just update quantity? 
                // But what if special instructions are different? 
                // Let's just append for now to be safe, or update if simple.
                // Actually, typically in restaurant apps, modifying options creates new line item.
                // Let's just find by ID for simplicity as per requirement "Quantity adjustment".
                const newItems = [...prevItems];
                newItems[existingItemIndex].quantity += quantity;
                // We might overwrite special instructions or keep existing. 
                // Let's keep it simple: new entry for every add action? 
                // "CartItem.js Shows: name, quantity controls..."
                // If I have 2 separate lines for "Karahi", it might look weird if they are identical.
                // Let's check matching ID.
                return newItems;
            }

            // If we want to group:
            // return [...prevItems, { ...item, quantity, specialInstructions }];

            // Let's stick to: check if ID exists, if so add quantity.
            // If user provided NEW special instructions for the same item, strictly speaking it should be separate.
            // But the CartScreen has a SINGLE "Order special request TextInput at bottom".
            // ItemDetailScreen has "Special instructions TextInput".
            // So individual items have special requests?
            // "ItemDetailScreen ... Special instructions TextInput".
            // "CartScreen ... Order special request TextInput at bottom".
            // So there is ITEM-level special note and ORDER-level special note.
            // Okay, I will store item-level note with the item.
            return [...prevItems, { ...item, quantity, specialInstructions }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        setCartItems(prevItems => {
            return prevItems.map(item => {
                if (item.id === itemId) {
                    return { ...item, quantity: Math.max(0, quantity) };
                }
                return item;
            });
            // Filter out 0 quantity? Or let removing be explicit? 
            // "remove button" exists. So 0 might not remove, just show 0? 
            // Usually controls min is 1.
        });
    };

    const clearCart = () => {
        setCartItems([]);
        setSpecialRequest('');
    };

    const getCartCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const getCartTotal = () => {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = 0;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartCount,
            getCartTotal,
            specialRequest,
            setSpecialRequest
        }}>
            {children}
        </CartContext.Provider>
    );
};
