export function validateEmail(email: string): { valid: boolean; normalized: string } {
  const normalized = email.trim().toLowerCase();
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return { valid: regex.test(normalized), normalized };
}
