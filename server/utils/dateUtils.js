function getDateRange(days) {
  if (typeof days !== "number" || days <= 0) {
    throw new Error("Days must be a positive number");
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return { startDate, endDate };
}

function formatDate(date) {
  if (!(date instanceof Date)) {
    throw new Error("Input must be a Date object");
  }
  return date.toISOString().split("T")[0];
}

module.exports = {
  getDateRange,
  formatDate,
};
