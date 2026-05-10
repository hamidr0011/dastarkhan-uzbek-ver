export const formatCurrency = (amount = 0) => {
    const value = Number(amount) || 0;

    return `${Math.round(value).toLocaleString('en-US')} UZS`;
};

export const CURRENCY_CODE = 'UZS';
