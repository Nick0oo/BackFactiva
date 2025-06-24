
export function getLabelFromEnum<T extends string | number>(
    value: T,
    labelMap: Record<T, string>,
  ): string {
    return labelMap[value] || '';
  }
  