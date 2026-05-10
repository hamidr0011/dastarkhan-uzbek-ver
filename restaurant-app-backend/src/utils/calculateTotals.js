const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = parseFloat(process.env.TAX_RATE || '0.10');
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100
    };
};

export default calculateTotals;
