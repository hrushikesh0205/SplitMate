export const calculateSplits = (amount, members, splitType, customSplits) => {
  const splits = [];

  if (splitType === 'equal') {
    const shareAmount = parseFloat((amount / members.length).toFixed(2));
    const remainder = parseFloat(
      (amount - shareAmount * members.length).toFixed(2)
    );

    members.forEach((userId, index) => {
      splits.push({
        user: userId,
        amount: index === 0 ? shareAmount + remainder : shareAmount,
        isPaid: false,
      });
    });
  }

  if (splitType === 'exact') {
    members.forEach((userId, index) => {
      splits.push({
        user: userId,
        amount: parseFloat(customSplits[index] || 0),
        isPaid: false,
      });
    });
  }

  if (splitType === 'percentage') {
    members.forEach((userId, index) => {
      const percent = parseFloat(customSplits[index] || 0);
      splits.push({
        user: userId,
        amount: parseFloat(((amount * percent) / 100).toFixed(2)),
        isPaid: false,
      });
    });
  }

  return splits;
};