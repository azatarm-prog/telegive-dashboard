export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatDate = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const formatUsername = (username?: string): string => {
  if (!username) return 'Unknown User';
  return username.startsWith('@') ? username : `@${username}`;
};

export const formatFullName = (firstName: string, lastName?: string): string => {
  return lastName ? `${firstName} ${lastName}` : firstName;
};

export const formatDuration = (startDate: string, endDate?: string): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffMs = end.getTime() - start.getTime();
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  } else {
    return `${diffMinutes}m`;
  }
};

export const getStatusColor = (status: string, isPublished?: boolean): string => {
  switch (status) {
    case 'active':
      return isPublished !== false ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100';
    case 'finished':
      return 'text-gray-600 bg-gray-100';
    case 'draft':
      return 'text-blue-600 bg-blue-100';
    case 'publishing':
      return 'text-yellow-600 bg-yellow-100';
    case 'publish_failed':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getStatusText = (status: string, isPublished?: boolean): string => {
  switch (status) {
    case 'active':
      return isPublished !== false ? 'Active' : 'Not Published';
    case 'finished':
      return 'Finished';
    case 'draft':
      return 'Draft';
    case 'publishing':
      return 'Publishing...';
    case 'publish_failed':
      return 'Publish Failed';
    default:
      return 'Unknown';
  }
};

