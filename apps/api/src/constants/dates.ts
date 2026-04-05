export const fifteenMinutes = () => 15 * 60 * 1000;

export const twentyFourHours = () => 24 * 60 * 60 * 1000;

export const thirtyDays = () => 30 * 24 * 60 * 60 * 1000;

export const fifteenMinutesFromNow = () =>
  new Date(Date.now() + fifteenMinutes());

export const thirtyDaysFromNow = () => new Date(Date.now() + thirtyDays());
