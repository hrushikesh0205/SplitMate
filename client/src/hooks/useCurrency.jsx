import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  DEFAULT_CURRENCY,
  normalizeCurrency,
  getCurrencySymbol,
  formatMoney,
  formatCompact,
} from '../lib/currency.jsx';

/**
 * Returns the logged-in user's currency preferences and formatters.
 * Re-renders automatically when profile.currency changes.
 */
export function useCurrency() {
  const { profile } = useAuth();
  const currency = normalizeCurrency(profile?.currency || DEFAULT_CURRENCY);

  return useMemo(
    () => ({
      currency,
      symbol: getCurrencySymbol(currency),
      formatMoney: (amount, opts) => formatMoney(amount, currency, opts),
      formatCompact: (amount) => formatCompact(amount, currency),
    }),
    [currency]
  );
}
