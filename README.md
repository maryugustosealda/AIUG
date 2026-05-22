# AIUG · AI 创作者社区

AI 创作者的聚集地。开发者上传 AI 应用(夸克网盘链接)、写教程、加入圈子、群组聊天。

## 本地开发

```bash
npm install
npm run db:push    # 创建数据库
npm run db:seed    # 灌入种子数据
npm run dev
```

打开 http://localhost:3000

**默认账号**(种子数据)
- 管理员:`admin@aiug.local` / `admin123`
- 创作者:`alice@aiug.local` / `demo123`(还有 bob、carol)

## 后台管理

登录管理员账号 → 右上角头像 → "管理后台",或直接访问 `/admin`。
管理员邮箱由 `.env` 的 `ADMIN_EMAILS` 控制(逗号分隔)。

## 上线部署

参考 [DEPLOY.md](./DEPLOY.md) 一步步操作,免费部署到 Vercel。

## 技术栈

- Next.js 14 App Router + TypeScript + Tailwind
- Prisma + SQLite(本地)/ PostgreSQL(生产)
- NextAuth(邮箱密码)
- 文件上传:本地文件系统 / Vercel Blob 双模式

## 目录结构

```
app/         路由(包含 api/)
components/  React 组件
lib/         prisma、auth、工具
prisma/      schema 与种子
scripts/     构建脚本
```

