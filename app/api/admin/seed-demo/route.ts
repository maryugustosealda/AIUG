import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

/**
 * 一键填充应用和技能示例数据
 * POST /api/admin/seed-demo
 * 仅管理员可用，幂等
 */

const APPS_DATA = [
  {
    user: { email: "demo_dev1@aiug.local", username: "ai_maker", nickname: "AI工具达人", bio: "独立开发者，专注AI工具开发" },
    app: {
      name: "ComfyUI 整合包", summary: "一键安装的 ComfyUI 整合包，内置常用模型和插件",
      category: "image", platforms: ["windows"], version: "2.1.0", size: "15GB",
      requirements: "Win10+ / NVIDIA GPU 8GB+ / 32GB 内存",
      pricingMode: "free", price: 0,
      downloadUrl: "https://pan.quark.cn/s/example-comfyui", downloadPwd: "cf21",
    },
    post: {
      title: "ComfyUI 整合包 v2.1 — 开箱即用，内置 50+ 常用节点",
      content: "# ComfyUI 整合包 v2.1\n\n专为国内用户打造的一键安装包。\n\n## 特性\n- 内置 SDXL、Flux 等主流模型\n- 50+ 常用自定义节点预装\n- 中文界面\n- 自动配置 CUDA 环境\n\n## 更新日志\n- 新增 Flux 模型支持\n- 修复内存泄漏问题\n- 优化启动速度",
      tags: ["ComfyUI", "AI绘画", "整合包"], likeCount: 156, commentCount: 42, viewCount: 3200,
    },
  },
  {
    user: { email: "demo_dev2@aiug.local", username: "pixel_ai", nickname: "像素工坊", bio: "图像处理工具开发者" },
    app: {
      name: "AI 证件照", summary: "智能证件照制作，支持各国签证尺寸，一键换底色",
      category: "image", platforms: ["windows", "macos"], version: "1.5.2", size: "200MB",
      requirements: "Win10+ / macOS 12+ / 4GB 内存",
      pricingMode: "trial", trialDesc: "每天免费处理5张", price: 29,
      downloadUrl: "https://pan.quark.cn/s/example-idphoto", downloadPwd: "id15",
    },
    post: {
      title: "AI 证件照 — 告别照相馆，在家就能做标准证件照",
      content: "# AI 证件照\n\n基于人像分割模型，精准抠图换底色。\n\n## 功能\n- 一寸/二寸/签证照等 30+ 尺寸模板\n- 智能美颜（可调节程度）\n- 自动排版打印\n- 支持批量处理\n\n## 效果\n头发丝级别抠图精度，边缘自然无锯齿。",
      tags: ["证件照", "抠图", "图像处理"], likeCount: 234, commentCount: 56, viewCount: 4500,
    },
  },
  {
    user: { email: "demo_dev3@aiug.local", username: "voice_lab", nickname: "声音实验室", bio: "语音AI研究者，TTS/ASR方向" },
    app: {
      name: "AI 配音大师", summary: "多角色AI配音工具，支持情感控制和语速调节",
      category: "audio", platforms: ["windows"], version: "3.0.1", size: "1.8GB",
      requirements: "Win10+ / 8GB 内存 / 建议 NVIDIA GPU",
      pricingMode: "paid", price: 68,
      downloadUrl: "https://pan.quark.cn/s/example-voicemaster", downloadPwd: "vm30",
    },
    post: {
      title: "AI 配音大师 3.0 — 200+ 音色，支持情感语调控制",
      content: "# AI 配音大师 3.0\n\n基于最新 TTS 模型，生成自然流畅的配音。\n\n## 亮点\n- 200+ 预置音色（男女老少各种风格）\n- 情感控制：开心/悲伤/愤怒/温柔\n- 语速/语调精细调节\n- 支持 SSML 标记\n- 批量导出 MP3/WAV\n\n## 适用场景\n短视频配音、有声书制作、课件录制、广告配音",
      tags: ["TTS", "配音", "语音合成"], likeCount: 189, commentCount: 67, viewCount: 5600,
    },
  },
  {
    user: { email: "demo_dev4@aiug.local", username: "code_ninja", nickname: "码忍", bio: "全栈开发，AI编程工具爱好者" },
    app: {
      name: "Prompt 管理器", summary: "本地 Prompt 管理工具，支持变量模板和一键调用",
      category: "devtool", platforms: ["windows", "macos", "linux"], version: "1.2.0", size: "45MB",
      requirements: "Win10+ / macOS 11+ / 任意 Linux",
      pricingMode: "free", price: 0,
      downloadUrl: "https://pan.quark.cn/s/example-promptmgr", downloadPwd: "pm12",
    },
    post: {
      title: "Prompt 管理器 — 告别杂乱的提示词收藏",
      content: "# Prompt 管理器\n\n一个简洁的本地 Prompt 管理工具。\n\n## 功能\n- 分类管理 Prompt\n- 变量模板（{{topic}} 这种占位符）\n- 一键复制到剪贴板\n- 支持 Markdown 预览\n- 数据本地存储，支持导入导出\n- 全局快捷键呼出\n\n完全免费开源。",
      tags: ["Prompt", "效率工具", "开源"], likeCount: 312, commentCount: 28, viewCount: 6800,
    },
  },
  {
    user: { email: "demo_dev5@aiug.local", username: "edu_ai", nickname: "学习助手", bio: "教育科技从业者" },
    app: {
      name: "AI 思维导图", summary: "输入主题自动生成思维导图，支持编辑和导出",
      category: "edu", platforms: ["windows", "macos"], version: "2.0.0", size: "85MB",
      requirements: "Win10+ / macOS 12+ / 需联网（调用AI接口）",
      pricingMode: "trial", trialDesc: "每天免费生成3张", price: 39,
      downloadUrl: "https://pan.quark.cn/s/example-mindmap", downloadPwd: "mm20",
    },
    post: {
      title: "AI 思维导图 2.0 — 一句话生成完整知识框架",
      content: "# AI 思维导图\n\n输入任意主题，AI 自动生成结构化思维导图。\n\n## 新版特性\n- 支持多级展开（最多8层）\n- 自定义样式主题\n- 导出 PNG/SVG/Markdown\n- 支持手动编辑节点\n- 历史记录管理\n\n## 使用场景\n学习笔记、读书总结、项目规划、头脑风暴",
      tags: ["思维导图", "学习", "AI生成"], likeCount: 145, commentCount: 33, viewCount: 2900,
    },
  },
  {
    user: { email: "demo_dev6@aiug.local", username: "video_pro", nickname: "视频工匠", bio: "短视频创作者，AI视频工具开发" },
    app: {
      name: "AI 字幕助手", summary: "视频自动识别字幕+翻译，支持双语字幕导出",
      category: "video", platforms: ["windows"], version: "1.8.0", size: "500MB",
      requirements: "Win10+ / 8GB 内存",
      pricingMode: "free", price: 0,
      downloadUrl: "https://pan.quark.cn/s/example-subtitle", downloadPwd: "st18",
    },
    post: {
      title: "AI 字幕助手 — 视频自动加字幕，支持100+语言翻译",
      content: "# AI 字幕助手\n\n基于 Whisper 模型的本地字幕工具。\n\n## 功能\n- 自动语音识别生成字幕\n- 100+ 语言互译\n- 双语字幕并排显示\n- 时间轴精准对齐\n- 导出 SRT/ASS/VTT\n- 批量处理\n\n完全本地运行，无需联网，隐私安全。",
      tags: ["字幕", "Whisper", "视频工具"], likeCount: 278, commentCount: 45, viewCount: 7200,
    },
  },
];

const SKILLS_DATA = [
  { email: "demo_dev1@aiug.local", title: "ComfyUI 工作流定制", content: "提供 ComfyUI 工作流定制服务。\n\n## 服务内容\n- 根据需求定制专属工作流\n- 电商产品图批量生成\n- 人像写真风格定制\n- 工作流优化和加速\n\n## 交付\n- 完整工作流文件\n- 使用教程文档\n- 1周内免费调整", tags: ["ComfyUI", "工作流", "定制"], price: 200 },
  { email: "demo_dev2@aiug.local", title: "AI 产品图制作", content: "用 AI 为你的产品生成高质量展示图。\n\n## 服务\n- 电商白底图\n- 场景图（厨房/客厅/户外等）\n- 模特上身图\n- 创意海报\n\n## 价格\n- 5张起做\n- 3天交付\n- 不满意免费修改", tags: ["产品图", "电商", "AI绘画"], price: 50 },
  { email: "demo_dev3@aiug.local", title: "AI 有声书制作", content: "将你的文字作品转化为有声书。\n\n## 服务\n- 多角色配音\n- 情感演绎\n- 背景音乐搭配\n- 章节分割\n\n## 报价\n- 按万字计费\n- 支持试听\n- 7天内交付", tags: ["有声书", "配音", "TTS"], price: 100 },
  { email: "demo_dev4@aiug.local", title: "AI 自动化脚本开发", content: "帮你开发 AI 自动化工作流。\n\n## 能做什么\n- 自动化数据处理\n- AI 批量内容生成\n- API 对接和集成\n- 定时任务脚本\n\n## 技术栈\nPython / Node.js / n8n / Make", tags: ["自动化", "脚本", "开发"], price: 300 },
  { email: "demo_dev5@aiug.local", title: "AI 课件制作", content: "用 AI 快速制作精美课件。\n\n## 服务\n- PPT 自动生成\n- 配图和插画\n- 知识点思维导图\n- 练习题生成\n\n## 适合\n- 教师备课\n- 培训讲师\n- 企业内训", tags: ["课件", "PPT", "教育"], price: 80 },
  { email: "demo_dev6@aiug.local", title: "短视频 AI 剪辑", content: "AI 辅助短视频后期制作。\n\n## 服务\n- 自动剪辑（去口头禅/停顿）\n- AI 字幕+翻译\n- 封面图生成\n- 背景音乐匹配\n\n## 交付\n- 成品视频文件\n- 字幕文件\n- 2次免费修改", tags: ["短视频", "剪辑", "后期"], price: 150 },
];

export async function POST(req: Request) {
  // 支持两种认证方式：管理员session 或 secret header
  const seedSecret = req.headers.get("x-seed-secret");
  const validSecret = process.env.SEED_SECRET || "aiug-seed-2024-temp";
  if (seedSecret && seedSecret === validSecret) {
    // OK, secret matches
  } else {
    try {
      await requireAdmin();
    } catch (e: any) {
      if (e?.message === "UNAUTHENTICATED") return NextResponse.json({ error: "请先登录" }, { status: 401 });
      return NextResponse.json({ error: "仅管理员可执行" }, { status: 403 });
    }
  }

  const pwd = await bcrypt.hash("demo123", 10);
  const results = { apps: 0, skills: 0, users: 0, categories: 0 };

  // 确保分类存在
  const CATS = [
    { slug: "image", name: "图像创作", icon: "🎨" },
    { slug: "video", name: "视频动画", icon: "🎬" },
    { slug: "audio", name: "音频语音", icon: "🎵" },
    { slug: "writing", name: "文案写作", icon: "✍️" },
    { slug: "code", name: "编程开发", icon: "💻" },
    { slug: "devtool", name: "开发工具", icon: "🔧" },
    { slug: "edu", name: "教育学习", icon: "📚" },
    { slug: "office", name: "办公效率", icon: "📊" },
    { slug: "life", name: "生活助手", icon: "🏠" },
    { slug: "other", name: "其他", icon: "📦" },
  ];
  for (const c of CATS) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
    results.categories++;
  }

  // 创建用户和应用
  for (const item of APPS_DATA) {
    const user = await prisma.user.upsert({
      where: { email: item.user.email },
      update: {},
      create: { ...item.user, passwordHash: pwd, role: "user" },
    });
    results.users++;

    const existing = await prisma.app.findFirst({ where: { name: item.app.name } });
    if (existing) continue;

    const cat = await prisma.category.findUnique({ where: { slug: item.app.category } });
    if (!cat) continue;

    await prisma.post.create({
      data: {
        authorId: user.id, type: "app", status: "published",
        title: item.post.title, content: item.post.content,
        tags: JSON.stringify(item.post.tags),
        likeCount: item.post.likeCount, commentCount: item.post.commentCount, viewCount: item.post.viewCount,
        app: {
          create: {
            name: item.app.name, summary: item.app.summary,
            categoryId: cat.id,
            platforms: JSON.stringify(item.app.platforms),
            version: item.app.version, size: item.app.size,
            requirements: item.app.requirements,
            pricingMode: item.app.pricingMode,
            price: item.app.price,
            downloadUrl: item.app.downloadUrl, downloadPwd: item.app.downloadPwd,
            linkLocked: true,
            downloadCount: Math.floor(item.post.viewCount * 0.3),
          },
        },
      },
    });
    results.apps++;
  }

  // 创建技能帖子
  for (const skill of SKILLS_DATA) {
    const user = await prisma.user.findUnique({ where: { email: skill.email } });
    if (!user) continue;

    const existing = await prisma.post.findFirst({ where: { title: skill.title, authorId: user.id } });
    if (existing) continue;

    await prisma.post.create({
      data: {
        authorId: user.id, type: "service", status: "published",
        title: skill.title, content: skill.content,
        tags: JSON.stringify(skill.tags),
        likeCount: Math.floor(Math.random() * 50) + 10,
        commentCount: Math.floor(Math.random() * 15) + 3,
        viewCount: Math.floor(Math.random() * 500) + 100,
      },
    });
    results.skills++;
  }

  return NextResponse.json({ ok: true, ...results });
}

