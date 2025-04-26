// Helper function to normalize keys to lowercase
const normalizeKey = (key: string) => key.toLowerCase();

export const mergeObjectsIgnoreCase = (
  obj1: Record<string, any>,
  obj2: Record<string, any>,
): Record<string, any> => {
  const mergedObj: Record<string, any> = {};

  // Merge both objects
  [obj1, obj2].forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      const normalizedKey = normalizeKey(key);
      mergedObj[normalizedKey] = obj[key];
    });
  });

  return mergedObj;
};
