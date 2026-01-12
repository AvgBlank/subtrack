export const getDays = (month: number, year: number): number => {
  if (month === 2) {
    // February, check for leap year
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      return 29;
    } else {
      return 28;
    }
  } else if ([4, 6, 9, 11].includes(month)) {
    // April, June, September, November
    return 30;
  } else {
    // All other months
    return 31;
  }
};
