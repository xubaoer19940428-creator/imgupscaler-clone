/**
 * API 文档中的分页参数有不同上限。
 * 统一在客户端收敛边界，避免每个领域模块各自实现一套不一致的 Math.min/Math.max。
 */
export function page(value = 1) {
  return positiveInteger(value, 1);
}

export function pageSize(value = 20, maximum = 50) {
  return Math.min(maximum, positiveInteger(value, 20));
}

export function limit(value: number, maximum: number) {
  return Math.min(maximum, positiveInteger(value, 1));
}

function positiveInteger(value: number, fallback: number) {
  return Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : fallback;
}
