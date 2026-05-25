import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
const MAX_BYTES = 4 * 1024 * 1024; // 4MB

export async function POST(req: Request) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const fd = await req.formData();
  const file = fd.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "缺少文件" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "仅支持图片格式" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "文件不可超过 4MB" }, { status: 400 });

  const ext = file.type.split("/")[1].replace("svg+xml", "svg");
  const filename = `${Date.now()}-${nanoid(8)}.${ext}`;

  // 生产环境(Vercel)用 Vercel Blob;本地开发用文件系统
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json({ url: blob.url });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buf);
  return NextResponse.json({ url: `/uploads/${filename}` });
}

