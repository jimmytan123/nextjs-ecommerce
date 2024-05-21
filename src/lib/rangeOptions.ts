import { subDays, startOfDay } from 'date-fns';

export const RANGE_OPTIONS = {
  last_7_days: {
    label: 'Last 7 days',
    startDate: startOfDay(subDays(new Date(), 6)),
    endDate: null,
  },
  last_30_days: {
    label: 'Last 30 days',
    startDate: startOfDay(subDays(new Date(), 29)),
    endDate: null,
  },
  last_90_days: {
    label: 'Last 90 days',
    startDate: startOfDay(subDays(new Date(), 89)),
    endDate: null,
  },
  last_365_days: {
    label: 'Last 365 days',
    startDate: startOfDay(subDays(new Date(), 364)),
    endDate: null,
  },
  all_time: {
    label: 'All Time',
    startDate: null,
    endDate: null,
  },
};

export function getRangeOption(range?: string) {
  if (range == null) return;

  return RANGE_OPTIONS[range as keyof typeof RANGE_OPTIONS];
}
