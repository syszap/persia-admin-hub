const faNum = new Intl.NumberFormat('fa-IR');
const faDate = new Intl.DateTimeFormat('fa-IR');

export const formatNumber = (n: number | null | undefined): string => {
  if (n == null) return '—';
  return faNum.format(n);
};

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  try {
    return faDate.format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

export const isOverdue = (dateStr: string | null | undefined): boolean =>
  !!dateStr && dateStr < new Date().toISOString().slice(0, 10);
