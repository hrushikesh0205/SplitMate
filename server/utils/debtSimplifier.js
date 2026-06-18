export const simplifyDebts = (balances) => {
  
  const netBalance = {};
  
  balances.forEach(({ from, to, amount }) => {
    netBalance[from] = (netBalance[from] || 0) - amount;
    netBalance[to] = (netBalance[to] || 0) + amount;
  });

  const creditors = [];
  const debtors = [];

  Object.entries(netBalance).forEach(([person, balance]) => {
    if (balance > 0.01) creditors.push({ person, amount: balance });
    if (balance < -0.01) debtors.push({ person, amount: -balance });
  });

  const transactions = [];

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: debtor.person,
      to: creditor.person,
      amount: parseFloat(amount.toFixed(2)),
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
};