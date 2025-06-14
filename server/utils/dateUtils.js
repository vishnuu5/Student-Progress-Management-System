function getDateRange(days) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return { startDate, endDate };
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

module.exports = {
  getDateRange,
  formatDate,
};
