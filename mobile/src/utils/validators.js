export const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isStrongPassword = (pw) => pw.length >= 8;
export const isNotEmpty = (val) => val && val.toString().trim().length > 0;