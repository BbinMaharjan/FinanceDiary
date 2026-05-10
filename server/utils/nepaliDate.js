const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toEnglishMonth(date) {
  return {
    month: ENGLISH_MONTHS[date.getMonth()],
    year: date.getFullYear(),
  };
}

module.exports = { ENGLISH_MONTHS, toEnglishMonth };
