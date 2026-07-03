import {
  Utensils, Car, Home, Film, ShoppingBag, Plane, HeartPulse,
  Receipt, Zap, GraduationCap, Gift, MoreHorizontal,
} from 'lucide-react';

export const CATEGORIES = [
  { key: 'food', label: 'Food & Drink', icon: Utensils, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { key: 'transport', label: 'Transport', icon: Car, color: 'text-sky-500', bg: 'bg-sky-500/10' },
  { key: 'rent', label: 'Rent & Bills', icon: Home, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { key: 'utilities', label: 'Utilities', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { key: 'entertainment', label: 'Entertainment', icon: Film, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { key: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
  { key: 'travel', label: 'Travel', icon: Plane, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { key: 'health', label: 'Health', icon: HeartPulse, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { key: 'education', label: 'Education', icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { key: 'gift', label: 'Gift', icon: Gift, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { key: 'general', label: 'General', icon: Receipt, color: 'text-slate-500', bg: 'bg-slate-500/10' },
  { key: 'other', label: 'Other', icon: MoreHorizontal, color: 'text-ink-400', bg: 'bg-ink-400/10' },
];

export function categoryMeta(key) {
  return CATEGORIES.find((c) => c.key === key) || CATEGORIES[CATEGORIES.length - 1];
}
