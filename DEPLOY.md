# 部署指南(Vercel + Neon + Vercel Blob,全免费)

跟着步骤走,**预计耗时 20 分钟**。中间任何一步遇到问题,告诉我具体错误信息。

---

## 准备工作:注册 3 个免费账号

| 平台 | 用途 | 注册地址 |
|---|---|---|
| GitHub | 存放代码 | https://github.com/signup |
| Vercel | 托管网站 | https://vercel.com/signup |
| Neon | 云数据库 | https://neon.tech |

**省事建议**:Vercel 和 Neon 都直接选"用 GitHub 登录",不用再单独建账号。

---

## 第 1 步:把代码传到 GitHub

### 1.1 安装 Git(如果还没有)

去 https://git-scm.com/download/win 下载安装,装完打开新的 PowerShell 输入 `git --version` 应该能看到版本号。

### 1.2 配置 Git(只需要做一次)

```powershell
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

### 1.3 在 GitHub 创建仓库

1. 登录 GitHub → 右上角 + → New repository
2. 仓库名填 `aiug`(随意),**Private**(私有)
3. **不要勾** "Initialize with README"
4. 点 "Create repository"
5. 创建完看到一页提示,记下 SSH 或 HTTPS 地址,长这样:`https://github.com/你的用户名/aiug.git`

### 1.4 在本地推送

打开 PowerShell,进到项目目录:

```powershell
cd D:\AIUG
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/aiug.git
git push -u origin main
```

第一次 push 会让你登录 GitHub,跟着提示走即可。完成后刷新 GitHub 仓库页面应该能看到所有文件。

> ⚠️ **`.env` 文件不会被推上去**(已在 `.gitignore`),这是对的,密钥不要进 Git。

---

## 第 2 步:在 Neon 建数据库

1. 打开 https://console.neon.tech,用 GitHub 登录
2. 点 "Create a project"
   - Project name:`aiug`
   - Postgres version:默认 16
   - Region:**Singapore**(国内访问最快的免费区)
3. 创建完会跳出 **Connection string**,长这样:
   ```
   postgresql://neondb_owner:xxxxxx@ep-xxx-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **复制这个字符串,先记到记事本里**,下一步要用

---

## 第 3 步:在 Vercel 部署

### 3.1 导入项目

1. 打开 https://vercel.com,用 GitHub 登录
2. 首页点 "Add New..." → "Project"
3. 找到刚才创建的 `aiug` 仓库,点 "Import"

### 3.2 配置环境变量(关键)

在 "Configure Project" 页面,展开 **Environment Variables**,逐个添加:

| Name | Value |
|---|---|
| `DATABASE_URL` | 第 2 步从 Neon 复制的连接串 |
| `NEXTAUTH_SECRET` | 一段长随机串,可以用 https://generate-secret.vercel.app/32 生成 |
| `NEXTAUTH_URL` | 暂时填 `https://aiug.vercel.app`(部署完拿到真实域名再改) |
| `ADMIN_EMAILS` | 你想作为管理员的邮箱,例如 `you@example.com` |

### 3.3 点 Deploy

等 2~5 分钟。第一次部署会:
1. 自动安装依赖
2. 自动把 `schema.prisma` 切到 postgresql
3. 自动在 Neon 上建表
4. 自动构建 Next.js

完成后会跳到一个有烟花的页面,点 "Continue to Dashboard"。

### 3.4 拿到真实域名

Dashboard 顶部能看到部署后的域名,例如 `https://aiug-xxx.vercel.app`。

回到 Settings → Environment Variables,把 `NEXTAUTH_URL` 改成这个真实域名。

然后 Deployments → 最新一条 → 右侧三点菜单 → "Redeploy" 重新部署一次,让新的 NEXTAUTH_URL 生效。

---

## 第 4 步:开启 Vercel Blob(图片上传)

如果不开,头像 / Logo / 封面图上传都会失败。

1. Vercel 项目 → Storage 标签 → "Create Database" → 选 **Blob**
2. 名称随便,Region 选 Singapore,创建
3. 创建完会有 "Connect to Project",点连接到当前 `aiug` 项目
4. 这一步会自动注入 `BLOB_READ_WRITE_TOKEN` 环境变量
5. 再 Redeploy 一次让代码生效

---

## 第 5 步:灌入种子数据(可选)

新数据库是空的,首页会没有内容。两种填法:

**方式 A:本地连远程数据库灌种子**(推荐)

```powershell
# 临时设置环境变量(只在当前 PowerShell 窗口生效)
$env:DATABASE_URL="第 2 步的 Neon 连接串"
# 修改 prisma/schema.prisma 里的 provider 为 postgresql(临时)
npx prisma db push
npm run db:seed
# 灌完记得把 schema.prisma 改回 sqlite,不然本地开发会报错
```

**方式 B:直接在网站上注册账号、手动发帖**(更真实)
- 用你在 ADMIN_EMAILS 里设置的邮箱注册,自动是管理员
- 在 `/admin/circles` 创建几个圈子
- 自己发几个帖子和应用

---

## 第 6 步:验证

打开你的 Vercel 域名:

- 首页能看到 banner 和(空的或种子的)feed
- 注册账号 → 登录 → 发帖 → 上传图片(测 Blob)
- 用 ADMIN_EMAILS 里的邮箱登录 → 右上角头像看是否有 "管理后台"

✅ 都正常就上线成功了。

---

## 后续怎么改代码?

本地改完 → `git add . && git commit -m "改了xx" && git push` → Vercel 自动重新部署。

---

## 常见问题

**Q: NEXTAUTH_URL 必须是 https 吗?**  
A: 是,Vercel 自动给你 HTTPS,填 `https://...` 即可。

**Q: Neon 免费版能撑多少用户?**  
A: 0.5GB 存储 + 191 计算小时/月,**几百用户问题不大**。

**Q: Vercel Blob 免费版能撑多少?**  
A: 1GB 存储 + 10GB 流量/月。给头像和封面用很够。

**Q: 想绑自己的域名?**  
A: Vercel → Settings → Domains → 添加你的域名,按提示改 DNS 即可。**国内不备案的域名能正常解析,但走 Vercel 边缘节点访问可能偶尔被墙。**

**Q: 国内访问慢怎么办?**  
A: Vercel 在大陆没有节点,免费版海外 IP 国内访问 100~500ms,可接受但不快。如果要做正式国内运营,长期还是建议备案 + 国内云服务器。

**Q: 要把数据库切回本地 SQLite?**  
A: 把 `prisma/schema.prisma` 里的 `provider` 改回 `"sqlite"`,`.env` 的 `DATABASE_URL` 改回 `"file:./dev.db"`,跑一遍 `npx prisma db push` 即可。

