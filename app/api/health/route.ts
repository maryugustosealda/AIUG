import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * 轻量健康检查,仅用于移动端启动时唤醒函数。
 * 不查数据库,毫秒级响应。
 */
export async function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() });
}

