import { IDailyPnL } from "../types/analytics.types";

export const buildPnlSeries = (days: IDailyPnL[], rangeDays: number) => {
  const pnlByDate = new Map(days.map((day) => [day.date, day.pnl]));
  const today = new Date();

  return Array.from({ length: rangeDays }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (rangeDays - 1 - index));
    const key = date.toISOString().split("T")[0];

    return {
      date: key,
      pnl: pnlByDate.get(key) ?? 0,
      trades: days.find((day) => day.date === key)?.trades ?? 0,
    };
  });
};

export const getRangeDescription = (days: number) => {
  if (days === 1) return "Today";
  if (days === 7) return "Last 7 days";
  if (days === 30) return "Last 30 days";
  if (days === 90) return "Last 3 months";
  if (days === 180) return "Last 6 months";
  return "Last 1 year";
};

export const shouldShowDateLabel = (index: number, total: number) => {
  if (total <= 7) return true;
  if (total <= 30) return index % 6 === 0;
  if (total <= 90) return index % 15 === 0;
  if (total <= 180) return index % 30 === 0;
  return index % 60 === 0;
};

export const formatMoney = (value: number | null | undefined) =>
  `$${(value ?? 0).toFixed(2)}`;

export const formatPercent = (value: number | null | undefined) =>
  `${(value ?? 0).toFixed(2)}%`;

export const formatProfitFactor = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(2)
    : "N/A";
