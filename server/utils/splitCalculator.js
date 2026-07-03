export const calculateSplits = (amount, members, splitType, customSplits) => {
  const splits = [];
  const customByUser = Array.isArray(customSplits)
    ? customSplits.reduce((acc, item, index) => {
        if (item && typeof item === 'object') {
          const id = item.user || item.userId || item.user_id;
          if (id) acc[id.toString()] = item.amount ?? item.value ?? item.percent;
        } else {
          acc[members[index]] = item;
        }
        return acc;
      }, {})
    : customSplits || {};

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
    members.forEach((userId) => {
      splits.push({
        user: userId,
        amount: parseFloat(customByUser[userId] || 0),
        isPaid: false,
      });
    });
  }

  if (splitType === 'percentage') {
    members.forEach((userId) => {
      const percent = parseFloat(customByUser[userId] || 0);
      splits.push({
        user: userId,
        amount: parseFloat(((amount * percent) / 100).toFixed(2)),
        isPaid: false,
      });
    });
  }

  return splits;
};
