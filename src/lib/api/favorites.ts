import { get, post } from "@/src/lib/api/request";

/** 添加一个目标到当前用户的收藏。 */
export const addFavorite = (type: string, targetId: number) =>
  post<{ favorited: boolean }>("/favorites", {
    type,
    target_id: targetId,
  });

/** 取消当前用户对一个目标的收藏。 */
export const removeFavorite = (type: string, targetId: number) =>
  post<{ favorited: boolean }>("/favorites/remove", {
    type,
    target_id: targetId,
  });

/** 切换一个目标的收藏状态。 */
export const toggleFavorite = (type: string, targetId: number) =>
  post<{ favorited: boolean }>("/favorites/toggle", {
    type,
    target_id: targetId,
  });

/** 检查单个目标是否已收藏。 */
export const checkFavorite = (type: string, targetId: number) =>
  get<{ favorited: boolean }>("/favorites/check", {
    type,
    target_id: targetId,
  });

/** 批量检查多个目标的收藏状态。 */
export const checkFavorites = (type: string, targetIds: number[]) =>
  post<{ favorites: Record<string, boolean> }>("/favorites/check-batch", {
    type,
    target_ids: targetIds,
  });

/** 获取当前用户收藏的目标 ID 列表。 */
export const favoriteIds = (type: string) =>
  get<{ ids: number[] }>(
    "/favorites/ids",
    { type },
  );
