import { get } from "@/src/lib/api/request";
import type { Paged } from "@/src/lib/api/types";
import {
  page as normalizePage,
  pageSize as normalizePageSize,
} from "@/src/lib/api/pagination";

/**
 * 获取金币和会员的变动流水。
 * recordType 按文档传入具体的流水类型时，可缩小结果范围。
 */
export const accountRecords = (
  page = 1,
  pageSize = 20,
  recordType?: string,
) =>
  get<Paged<Record<string, unknown>>>("/account/records", {
    page: normalizePage(page),
    page_size: normalizePageSize(pageSize, 50),
    ...(recordType ? { record_type: recordType } : {}),
  });

/** 获取当前账号的登录设备列表。 */
export const accountDevices = (page = 1, pageSize = 20) =>
  get<Paged<Record<string, unknown>>>(
    "/account/devices",
    {
      page: normalizePage(page),
      page_size: normalizePageSize(pageSize, 50),
    },
  );
