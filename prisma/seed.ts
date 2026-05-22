/* eslint-disable @typescript-eslint/no-var-requires */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATS = [
  { slug: "image", name: "图像创作", icon: "🎨" },
  { slug: "video", name: "视频动画", icon: "🎬" },
  { slug: "audio", name: "音频语音", icon: "🎵" },
  { slug: "writing", name: "写作办公", icon: "✍️" },
  { slug: "code", name: "编程开发", icon: "💻" },
  { slug: "edu", name: "学习教育", icon: "📚" },
  { slug: "life", name: "生活娱乐", icon: "🎮" },
  { slug: "industry", name: "行业应用", icon: "🏢" },
  { slug: "devtool", name: "开发者工具", icon: "🛠️" },
];

const CIRCLES = [
  { slug: "ai-art", name: "AI 绘画", icon: "🎨", description: "Stable Diffusion / ComfyUI / Midjourney 实战与作品分享" },
  { slug: "ai-video", name: "AI 视频", icon: "🎬", description: "数字人 / 视频生成 / 换脸 / 对口型" },
  { slug: "ai-write", name: "AI 写作", icon: "✍️", description: "文案 / 翻译 / 长文创作技巧" },
  { slug: "ai-code", name: "AI 编程", icon: "💻", description: "Cursor / Claude Code / Copilot 与开源 Coding Agent" },
  { slug: "prompt", name: "Prompt 实验室", icon: "🧪", description: "高质量 Prompt 与提示词工程" },
  { slug: "tools", name: "效率工具", icon: "⚡", description: "解放双手的 AI 工具发现" },
  { slug: "newbie", name: "萌新求助", icon: "🐣", description: "新人友好提问区,有问必答" },
];

async function main() {
  // 分类
  for (const c of CATS) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  // 圈子
  for (const c of CIRCLES) {
    await prisma.circle.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  // 管理员账号
  const adminPwd = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@aiug.local" },
    update: {},
    create: {
      email: "admin@aiug.local", username: "admin", nickname: "管理员",
      passwordHash: adminPwd, role: "admin",
      bio: "AIUG 平台管理员,欢迎反馈与建议",
    },
  });

  // 示例创作者
  const demoPwd = await bcrypt.hash("demo123", 10);
  const creators = [
    { email: "alice@aiug.local", username: "alice", nickname: "Alice 设计师", bio: "AI 绘画 3 年,ComfyUI 重度用户" },
    { email: "bob@aiug.local",   username: "bob",   nickname: "Bob 程序猿",   bio: "独立开发者,做了几个 AI 小工具" },
    { email: "carol@aiug.local", username: "carol", nickname: "Carol 写作者", bio: "用 AI 辅助写小说,产出 200 万字" },
  ];
  for (const c of creators) {
    await prisma.user.upsert({
      where: { email: c.email }, update: {},
      create: { ...c, passwordHash: demoPwd, role: "user" },
    });
  }

  const alice = await prisma.user.findUnique({ where: { email: "alice@aiug.local" } });
  const bob   = await prisma.user.findUnique({ where: { email: "bob@aiug.local" } });
  const carol = await prisma.user.findUnique({ where: { email: "carol@aiug.local" } });
  const cArt  = await prisma.circle.findUnique({ where: { slug: "ai-art" } });
  const cCode = await prisma.circle.findUnique({ where: { slug: "ai-code" } });
  const cTools = await prisma.circle.findUnique({ where: { slug: "tools" } });
  const catImage = await prisma.category.findUnique({ where: { slug: "image" } });
  const catCode  = await prisma.category.findUnique({ where: { slug: "code" } });
  const catWrite = await prisma.category.findUnique({ where: { slug: "writing" } });

  if (!alice || !bob || !carol || !catImage || !catCode || !catWrite) return;

  // 示例帖子(图文)— 仅在第一次运行时填充
  const hasPost = await prisma.post.count();
  const skipPosts = hasPost > 0;
  if (skipPosts) console.log("帖子已存在,跳过帖子创建");

  if (!skipPosts) {

  await prisma.post.create({
    data: {
      authorId: alice.id, type: "text", status: "published", circleId: cArt?.id,
      title: "ComfyUI 工作流分享:5 步出商业级海报",
      content: `# 我的常用 ComfyUI 工作流\n\n之前接的几个单子都是用这个流程交付的,效果稳定。\n\n## 步骤\n1. SDXL Base 出大图\n2. 局部重绘修手\n3. ControlNet 做版式\n4. Tile 上采样\n5. 后期统一调色\n\n> 工作流文件附在帖子末尾,有问题评论区见。\n\n**欢迎交流!**`,
      tags: JSON.stringify(["ComfyUI", "SDXL", "工作流"]),
      likeCount: 28, commentCount: 4, viewCount: 312,
    },
  });

  await prisma.post.create({
    data: {
      authorId: carol.id, type: "question", status: "published", circleId: undefined,
      title: "用 AI 写小说怎么避免读者一眼看出 AI 味?",
      content: "最近用 Claude 写长篇,前几章问题不大,后期总会出现重复句式和过度排比。大家有什么处理经验?\n\n目前我的做法:\n- 先用 AI 生大纲\n- 章节逐段生成\n- 人工改 30%~40%\n\n效率还行,但工作量也不小。求经验。",
      tags: JSON.stringify(["AI写作", "Claude", "小说"]),
      likeCount: 12, commentCount: 8, viewCount: 156,
    },
  });

  // 示例应用(已审核通过)
  await prisma.post.create({
    data: {
      authorId: bob.id, type: "app", status: "published", circleId: cCode?.id,
      title: "CodeGenie 1.2 — 离线代码助手,支持中文注释自动生成",
      content: `# CodeGenie\n\n一个本地运行的代码助手,基于 Qwen2.5-Coder-7B 微调。\n\n## 主要功能\n- 中文注释批量生成\n- 函数级单元测试生成\n- SQL 语句解释与优化\n- 完全本地运行,代码不出本机\n\n## 使用方法\n下载安装包后双击运行,首次启动会下载模型(约 5GB)。`,
      cover: null, tags: JSON.stringify(["代码助手", "本地部署", "Qwen"]),
      likeCount: 45, commentCount: 12, viewCount: 890,
      app: { create: {
        name: "CodeGenie", summary: "本地运行的中文代码助手,告别敏感代码上传焦虑",
        categoryId: catCode.id, platforms: JSON.stringify(["windows", "macos"]),
        screenshots: JSON.stringify([
          "https://picsum.photos/seed/codegenie1/1280/720",
          "https://picsum.photos/seed/codegenie2/1280/720",
          "https://picsum.photos/seed/codegenie3/1280/720",
        ]),
        version: "1.2.0", size: "5.2GB", requirements: "Win10+ / macOS 12+ / 16GB 内存 / 建议 NVIDIA GPU 8GB",
        pricingMode: "free", price: 0,
        downloadUrl: "https://pan.quark.cn/s/example-codegenie", downloadPwd: "ai01",
        linkLocked: true, downloadCount: 234,
      }},
    },
  });

  await prisma.post.create({
    data: {
      authorId: alice.id, type: "app", status: "published", circleId: cArt?.id,
      title: "PicCut Pro — 一键抠图工具,头发丝级精度",
      content: "# PicCut Pro\n\n基于 BiRefNet 的抠图工具,UI 简洁,效果好于 Photoshop 的主体选择。\n\n- 单图 1 秒处理\n- 支持批量\n- 输出透明 PNG / 替换背景\n\n试用版无水印,处理张数限制 30 张/天。",
      tags: JSON.stringify(["抠图", "BiRefNet", "图片处理"]),
      likeCount: 67, commentCount: 18, viewCount: 1240,
      app: { create: {
        name: "PicCut Pro", summary: "头发丝级 AI 抠图,单张 1 秒",
        categoryId: catImage.id, platforms: JSON.stringify(["windows"]),
        screenshots: JSON.stringify([
          "https://picsum.photos/seed/piccut1/1280/720",
          "https://picsum.photos/seed/piccut2/1280/720",
          "https://picsum.photos/seed/piccut3/1280/720",
          "https://picsum.photos/seed/piccut4/1280/720",
        ]),
        version: "2.1.0", size: "850MB", requirements: "Win10+ / 8GB 内存",
        pricingMode: "trial", trialDesc: "试用版无水印,每天处理 30 张",
        price: 49, downloadUrl: "https://pan.quark.cn/s/example-piccut", downloadPwd: "pc88",
        linkLocked: true, downloadCount: 567,
      }},
    },
  });

  await prisma.post.create({
    data: {
      authorId: carol.id, type: "app", status: "published", circleId: cTools?.id,
      title: "WriteFlow — Markdown 写作 + AI 续写一体化",
      content: "# WriteFlow\n\n本地 Markdown 写作工具,集成多家 AI(填自己的 API Key)。\n\n核心特性:\n- 选中续写、改写、扩写\n- 风格记忆(让 AI 学你的写作风格)\n- 双链笔记\n- 文件全部本地\n\n付费版终身买断 ¥99,无后续费用。",
      tags: JSON.stringify(["Markdown", "AI写作", "本地"]),
      likeCount: 89, commentCount: 24, viewCount: 1820,
      app: { create: {
        name: "WriteFlow", summary: "支持 AI 续写的本地 Markdown 编辑器",
        categoryId: catWrite.id, platforms: JSON.stringify(["windows", "macos", "linux"]),
        screenshots: JSON.stringify([
          "https://picsum.photos/seed/writeflow1/1280/720",
          "https://picsum.photos/seed/writeflow2/1280/720",
          "https://picsum.photos/seed/writeflow3/1280/720",
        ]),
        version: "0.9.5", size: "120MB", requirements: "Win10+ / macOS 11+ / 4GB 内存",
        pricingMode: "paid", price: 99,
        downloadUrl: "https://pan.quark.cn/s/example-writeflow", downloadPwd: "wf99",
        linkLocked: true, downloadCount: 88,
      }},
    },
  });

  // 一个待审核应用,方便管理后台展示
  await prisma.post.create({
    data: {
      authorId: bob.id, type: "app", status: "pending",
      title: "VoiceClone Mini — 5 秒克隆任意声音",
      content: "基于 GPT-SoVITS,5 秒采样克隆出可用的 TTS 声音。\n\n效果较好,纯本地运行。",
      tags: JSON.stringify(["语音克隆", "TTS", "GPT-SoVITS"]),
      app: { create: {
        name: "VoiceClone Mini", summary: "5 秒克隆任意人声的本地 TTS",
        categoryId: (await prisma.category.findUnique({ where: { slug: "audio" } }))!.id,
        platforms: JSON.stringify(["windows"]),
        version: "0.3.0", size: "2.1GB", requirements: "Win10+ / NVIDIA GPU 6GB+",
        pricingMode: "free",
        downloadUrl: "https://pan.quark.cn/s/example-voiceclone", downloadPwd: "vc55",
        linkLocked: false, downloadCount: 0,
      }},
    },
  });

  // 圈子帖子计数
  for (const c of [cArt, cCode, cTools]) {
    if (!c) continue;
    const cnt = await prisma.post.count({ where: { circleId: c.id, status: "published" } });
    await prisma.circle.update({ where: { id: c.id }, data: { postCount: cnt } });
  }
  } // end if (!skipPosts)

  // 默认公开聊天群
  const admin = await prisma.user.findUnique({ where: { email: "admin@aiug.local" } });
  if (admin && (await prisma.chatRoom.count()) === 0) {
    const rooms = [
      { name: "AIUG 大厅", icon: "👋", description: "全平台用户的公共大厅,新人报到、随便聊" },
      { name: "AI 绘画交流", icon: "🎨", description: "ComfyUI / SD / Midjourney / 图像作品分享" },
      { name: "AI 编程", icon: "💻", description: "Cursor / Claude Code / 模型 API 与开源 Agent" },
      { name: "求助答疑", icon: "❓", description: "新手求助、装环境、跑模型、调参问题" },
    ];
    for (const r of rooms) {
      const room = await prisma.chatRoom.create({
        data: { ...r, creatorId: admin.id, visibility: "public", memberCount: 4 },
      });
      // 把 4 个种子用户都拉进去
      for (const u of [admin, alice, bob, carol]) {
        await prisma.chatMember.create({
          data: { roomId: room.id, userId: u.id, role: u.id === admin.id ? "owner" : "member" },
        });
      }
      // 几条开场消息
      await prisma.chatMessage.create({
        data: { roomId: room.id, authorId: admin.id, type: "system", content: "群组创建,欢迎大家" },
      });
      await prisma.chatMessage.create({
        data: { roomId: room.id, authorId: alice.id, type: "text", content: `大家好,新群第一条 👋` },
      });
      await prisma.chatRoom.update({ where: { id: room.id }, data: { lastMsgAt: new Date() } });
    }
  }

  console.log("✅ 种子数据完成");
  console.log("   管理员: admin@aiug.local / admin123");
  console.log("   测试号: alice@aiug.local / demo123");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

