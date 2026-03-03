export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function cleanPhone(phone: string): string {
  return phone.trim().replace(/\s/g, '').replace(/\D/g, '');
}

export function isValidUAPhone(phone: string): boolean {
  const cleaned = cleanPhone(phone);
  if (cleaned.length === 9) {
    return /^0\d{8}$/.test(cleaned) || /^[356789]\d{8}$/.test(cleaned); // 099... або 99...
  }
  if (cleaned.length === 10) return /^0\d{9}$/.test(cleaned); // 068..., 044...
  if (cleaned.length === 11) return /^80\d{9}$/.test(cleaned);  // 80 99...
  if (cleaned.length === 12) return /^380\d{9}$/.test(cleaned);
  return false;
}

export function formatPhoneForSubmit(phone: string): string {
  const cleaned = cleanPhone(phone);
  if (cleaned.length === 9) {
    const rest = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
    return '+380' + rest;
  }
  if (cleaned.length === 10 && cleaned.startsWith('0')) return '+38' + cleaned;
  if (cleaned.length === 11 && cleaned.startsWith('80')) return '+3' + cleaned;
  if (cleaned.length === 12 && cleaned.startsWith('380')) return '+' + cleaned;
  return phone;
}
