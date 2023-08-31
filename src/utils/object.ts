export const getObjectTypedKeys = <T extends PropertyKey>(
    obj: Record<T, unknown> | Partial<Record<T, unknown>>
): T[] => {
    return Object.keys(obj) as T[];
};
