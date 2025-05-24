

export function enumToLabelValue<T extends Record<string, string | number>>(
    enumObj: T,
    labelMap: Record<T[keyof T], string>,
  ): { label: string; value: T[keyof T] }[] {
    return Object.values(enumObj).map((value) => ({
      value: value as T[keyof T],
      label: labelMap[value],
    }));
  }
  