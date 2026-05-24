const formatCurrency = (amount, currency = 'KSh') => {
  const map = { KSh: 'KES', USD: 'USD', EUR: 'EUR', GBP: 'GBP' };
  const code = map[currency] || 'KES';
  try {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: code }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

export default formatCurrency;