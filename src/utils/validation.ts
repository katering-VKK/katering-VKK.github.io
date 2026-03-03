export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidUAPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return (cleaned.length === 9 && /^0\d{8}$/.test(cleaned)) || 
         (cleaned.length === 12 && /^380\d{9}$/.test(cleaned));
}

export function formatPhoneForSubmit(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) return '+380' + cleaned;
  if (cleaned.length === 12 && cleaned.startsWith('380')) return '+' + cleaned;
  return phone;
}
