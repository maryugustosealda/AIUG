// 在 Vercel 构建前自动把 schema.prisma 的 provider 改为 postgresql。
// 本地开发不会跑这个脚本,继续用 SQLite。
// 触发条件:存在 VERCEL=1 环境变量(Vercel 自动注入)
const fs = require("fs");
const path = require("path");

if (!process.env.VERCEL) {
  console.log("[prepare-vercel] not on Vercel, skip");
  process.exit(0);
}

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
let s = fs.readFileSync(schemaPath, "utf8");

if (s.includes('provider = "sqlite"')) {
  s = s.replace('provider = "sqlite"', 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, s);
  console.log("[prepare-vercel] schema provider switched to postgresql");
} else {
  console.log("[prepare-vercel] provider already non-sqlite");
}

