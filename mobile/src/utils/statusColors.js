const statusColors = {
  active: { bg: '#D1FAE5', text: '#065F46' },
  pending: { bg: '#FEF3C7', text: '#92400E' },
  suspended: { bg: '#FEE2E2', text: '#991B1B' },
  draft: { bg: '#F3F4F6', text: '#374151' },
  sent: { bg: '#DBEAFE', text: '#1E40AF' },
  paid: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
  completed: { bg: '#D1FAE5', text: '#065F46' },
  processing: { bg: '#E0E7FF', text: '#3730A3' },
  approved: { bg: '#D1FAE5', text: '#065F46' },
  rejected: { bg: '#FEE2E2', text: '#991B1B' },
};

export const getStatusColor = (status) => statusColors[status] || { bg: '#F3F4F6', text: '#374151' };