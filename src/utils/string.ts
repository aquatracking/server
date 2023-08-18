export const capitalize = <T extends string>(value: T) =>
    `${value.charAt(0).toLocaleUpperCase()}${value.slice(1)}` as Capitalize<T>;
