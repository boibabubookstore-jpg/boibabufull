// Currency formatting utilities

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined) return '₹0.00';
  
  // Amount is already in rupees format
  const rupees = parseFloat(amount);
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rupees);
};

export const parseCurrency = (amount) => {
  if (!amount) return 0;
  // Return the amount as is (in rupees)
  return parseFloat(amount);
};

export const formatPrice = (price) => {
  if (!price) return '₹0.00';
  return formatCurrency(price);
};