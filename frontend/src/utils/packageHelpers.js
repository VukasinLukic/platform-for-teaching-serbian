/**
 * Helper functions for loading online package data
 */

let cachedPackages = null;

/**
 * Load packages from JSON file
 * @returns {Promise<Array>} Array of packages
 */
export const loadOnlinePackages = async () => {
  if (cachedPackages) {
    return cachedPackages;
  }

  try {
    const response = await fetch('/paketiOnlajnNastave.json');
    const packages = await response.json();
    cachedPackages = packages;
    return packages;
  } catch (error) {
    console.error('Error loading packages:', error);
    return [];
  }
};

/**
 * Get package by ID
 * @param {string} packageId
 * @returns {Promise<Object|null>}
 */
export const getPackageById = async (packageId) => {
  const packages = await loadOnlinePackages();
  return packages.find(pkg => pkg.id === packageId) || null;
};

/**
 * Get package name by ID
 * @param {string} packageId
 * @returns {Promise<string>}
 */
export const getPackageName = async (packageId) => {
  const packageData = await getPackageById(packageId);
  return packageData?.name || 'Непознат пакет';
};

/**
 * Clear cache (useful for testing)
 */
export const clearPackageCache = () => {
  cachedPackages = null;
};
