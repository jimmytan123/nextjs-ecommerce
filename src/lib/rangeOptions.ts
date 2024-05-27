import { subDays, startOfDay, isValid } from 'date-fns';
import { formatDate } from './formatters';

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

export function getRangeOption(range?: string, from?: string, to?: string) {
  // No pre-definded option selected, construct and return the option object
  if (range == null) {

    // Construct date object
    const startDate = new Date(from || '');
    const endDate = new Date(to || '');

    if (!isValid(startDate) || !isValid(endDate)) return;

    return {
      label: `${formatDate(startDate)} - ${formatDate(endDate)}}`,
      startDate,
      endDate,
    };
  }

  // Otherwise, return the pre-definded option info
  return RANGE_OPTIONS[range as keyof typeof RANGE_OPTIONS];
}
