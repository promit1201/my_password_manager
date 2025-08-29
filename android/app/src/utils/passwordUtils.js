export function getStrength(pw) {
  const len = pw?.length || 0;
  const hasAlnum = /[a-zA-Z]/.test(pw) && /\d/.test(pw);
  const score = (len > 8 ? 1 : 0) + (hasAlnum ? 1 : 0) + (/[!@#$%^&*]/.test(pw) ? 1 : 0);
  if (score >= 3) return { label: "Strong", color: "#16A34A" };
  if (score === 2) return { label: "Medium", color: "#CA8A04" };
  return { label: "Weak", color: "#EF4444" };
}
