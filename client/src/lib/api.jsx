/**
 * api.jsx — backwards-compatible re-export layer.
 *
 * Pages import everything from this single file. The actual network calls
 * live in the individual *Service.jsx modules so each domain can be updated
 * independently. No Supabase code remains here.
 */

// ---------- Re-exports from service modules ----------
export {
  fetchGroups,
  fetchGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  fetchMembers,
  addMember,
  removeMember,
} from './groupsService.jsx';

export {
  fetchExpenses,
  fetchAllExpenses,
  createExpense,
  deleteExpense,
} from './expensesService.jsx';

export {
  fetchSettlements,
  fetchAllSettlements,
  createSettlement,
} from './settlementsService.jsx';

export {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  insertNotification,
} from './notificationsService.jsx';

// ---------- Pure balance-calculation helpers (no network, no changes) ----------

/**
 * Compute the calling user's net balance across the supplied expenses + settlements.
 * Positive  → you are owed money.
 * Negative  → you owe money.
 */
export function computeBalances({ expenses = [], settlements = [], userId }) {
  const net = new Map();

  for (const e of expenses) {
    const amount = Number(e.amount || 0);
    const participants = e.split_between?.length ? e.split_between : [];
    if (!participants.length) continue;
    const fallbackShare = amount / participants.length;
    for (const p of participants) {
      const share = Number(e.split_amounts?.[p] ?? fallbackShare);
      net.set(p, (net.get(p) || 0) - share);
    }
    net.set(e.paid_by, (net.get(e.paid_by) || 0) + amount);
  }

  for (const s of settlements) {
    const amount = Number(s.amount || 0);
    net.set(s.payer, (net.get(s.payer) || 0) + amount);
    net.set(s.payee, (net.get(s.payee) || 0) - amount);
  }

  return net.get(userId) || 0;
}

/**
 * Compute per-member net balances and the minimal set of debt-clearing edges
 * for a single group.
 */
export function computeGroupBalances({ expenses = [], settlements = [], members = [] }) {
  const net = new Map();
  const memberIds = members.map((m) => m.user_id).filter(Boolean);

  for (const e of expenses) {
    const amount = Number(e.amount || 0);
    const participants = e.split_between?.length ? e.split_between : [];
    if (!participants.length) continue;
    const fallbackShare = amount / participants.length;
    for (const p of participants) {
      const share = Number(e.split_amounts?.[p] ?? fallbackShare);
      net.set(p, (net.get(p) || 0) - share);
    }
    net.set(e.paid_by, (net.get(e.paid_by) || 0) + amount);
  }

  for (const s of settlements) {
    const amount = Number(s.amount || 0);
    net.set(s.payer, (net.get(s.payer) || 0) + amount);
    net.set(s.payee, (net.get(s.payee) || 0) - amount);
  }

  const creditors = [];
  const debtors = [];
  for (const id of memberIds) {
    const v = net.get(id) || 0;
    if (v > 0.005) creditors.push({ id, amount: v });
    else if (v < -0.005) debtors.push({ id, amount: -v });
  }
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const edges = [];
  let ci = 0;
  const cRem = creditors.map((c) => c.amount);
  const dRem = debtors.map((d) => d.amount);
  for (let i = 0; i < debtors.length && ci < creditors.length; i++) {
    let pay = dRem[i];
    while (pay > 0.005 && ci < creditors.length) {
      const settle = Math.min(pay, cRem[ci]);
      if (settle > 0.005) {
        edges.push({ from: debtors[i].id, to: creditors[ci].id, amount: settle });
        pay -= settle;
        cRem[ci] -= settle;
      }
      if (cRem[ci] <= 0.005) ci++;
    }
  }

  return {
    net: Object.fromEntries(memberIds.map((id) => [id, net.get(id) || 0])),
    edges,
    members: memberIds,
  };
}
