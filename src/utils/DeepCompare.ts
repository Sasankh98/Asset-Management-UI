/**
 * Deep equality comparison for objects
 * Compares all properties recursively
 */
export function deepEqual<T>(obj1: T, obj2: T): boolean {
  // Handle primitive types and null/undefined
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  
  // Handle non-object types
  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;

  // Handle arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    return obj1.every((item, index) => deepEqual(item, obj2[index]));
  }

  // Handle dates
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  }

  // Handle objects
  const keys1 = Object.keys(obj1 as Record<string, unknown>);
  const keys2 = Object.keys(obj2 as Record<string, unknown>);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (
      !deepEqual(
        (obj1 as Record<string, unknown>)[key],
        (obj2 as Record<string, unknown>)[key]
      )
    ) {
      return false;
    }
  }

  return true;
}