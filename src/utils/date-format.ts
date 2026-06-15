import { formatDistanceToNowStrict, format, differenceInMonths } from 'date-fns';

export const formatTimeAgo = (dateString: string | Date) => {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const monthsDiff = differenceInMonths(now, date);

    // If more than 3 months old, show "Oct 2025" or "Oct 24"
    if (monthsDiff >= 3) {
      // If it's a different year, show the year. If same year, just month and day.
      const formatStr = now.getFullYear() !== date.getFullYear() ? 'MMM yyyy' : 'MMM d';
      return format(date, formatStr);
    }

    // Standard relative time logic
    const distance = formatDistanceToNowStrict(date);
    const unitMap: Record<string, string> = {
      second: 's',
      seconds: 's',
      minute: 'm',
      minutes: 'm',
      hour: 'hr',
      hours: 'hrs',
      day: 'd',
      days: 'd',
      month: 'mo',
      months: 'mo',
    };

    const [value, unit] = distance.split(' ');
    return `${value}${unitMap[unit] || unit} ago`;
  } catch (error) {
    return '';
  }
};
