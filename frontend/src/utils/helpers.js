/**
 * Helper utility functions
 */

/**
 * Format price to Serbian currency format
 * @param {number} amount
 * @returns {string}
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('sr-RS', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' RSD';
};

/**
 * Format date to Serbian locale
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('sr-RS', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
};

/**
 * Format date and time to Serbian locale
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('sr-RS', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

/**
 * Truncate text to specified length
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format video duration (seconds to HH:MM:SS or MM:SS)
 * @param {number} seconds
 * @returns {string}
 */
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get file extension from filename
 * @param {string} filename
 * @returns {string}
 */
export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Format file size
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Serbian phone number
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  // Serbian phone format: +381..., 06..., 06x/xxx-xxxx, etc.
  const phoneRegex = /^(\+381|0)6[0-9]{7,8}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

/**
 * Generate payment reference number
 * @returns {string}
 */
export const generatePaymentRef = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `KRS-${timestamp}-${random}`;
};

/**
 * Get transaction status label in Serbian
 * @param {string} status
 * @returns {string}
 */
export const getTransactionStatusLabel = (status) => {
  const labels = {
    pending: 'Na čekanju',
    confirmed: 'Potvrđeno',
    rejected: 'Odbijeno',
  };
  return labels[status] || status;
};

/**
 * Get transaction status color class
 * @param {string} status
 * @returns {string}
 */
export const getTransactionStatusColor = (status) => {
  const colors = {
    pending: 'text-yellow-600 bg-yellow-100',
    confirmed: 'text-green-600 bg-green-100',
    rejected: 'text-red-600 bg-red-100',
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
};
