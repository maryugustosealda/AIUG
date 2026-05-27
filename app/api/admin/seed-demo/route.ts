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
  { email: "demo_dev1@aiug.local", title: "ComfyUI 工作流定制", content: "提供 ComfyUI 工作流定制服务。\n\n## 服务内容\n- 根据需求定制专属工作流\n- 电商产品图批量生成\n- 人像写真风格定制\n- 工作流优化和加速\n\n## 交付\n- 完整工作流文件\n- 使用教程文档\n- 1周内免费调整", tags: ["ComfyUI", "工作流", "定制"],
    service: { category: "customize", summary: "根据需求定制ComfyUI专属工作流", packages: [{ name: "基础版", price: 200, deliveryDays: 3, deliverables: "1个工作流+教程", description: "单一功能工作流" }, { name: "高级版", price: 500, deliveryDays: 7, deliverables: "3个工作流+视频教程", description: "复杂多节点工作流" }], workSamples: ["https://images.unsplash.com/photo-1686191128892-3b37add4c844?w=400", "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?w=400"] }
  },
  { email: "demo_dev2@aiug.local", title: "AI 产品图制作", content: "用 AI 为你的产品生成高质量展示图。\n\n## 服务\n- 电商白底图\n- 场景图（厨房/客厅/户外等）\n- 模特上身图\n- 创意海报\n\n## 价格\n- 5张起做\n- 3天交付\n- 不满意免费修改", tags: ["产品图", "电商", "AI绘画"],
    service: { category: "outsource", summary: "AI生成高质量电商产品展示图", packages: [{ name: "5张", price: 50, deliveryDays: 2, deliverables: "5张产品图", description: "白底图或简单场景" }, { name: "20张", price: 150, deliveryDays: 5, deliverables: "20张产品图+2次修改", description: "多场景多角度" }], workSamples: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"] }
  },
  { email: "demo_dev3@aiug.local", title: "AI 有声书制作", content: "将你的文字作品转化为有声书。\n\n## 服务\n- 多角色配音\n- 情感演绎\n- 背景音乐搭配\n- 章节分割\n\n## 报价\n- 按万字计费\n- 支持试听\n- 7天内交付", tags: ["有声书", "配音", "TTS"],
    service: { category: "outsource", summary: "AI多角色配音制作有声书", packages: [{ name: "试听版", price: 30, deliveryDays: 1, deliverables: "1000字试听音频", description: "确认音色和风格" }, { name: "标准版", price: 100, deliveryDays: 7, deliverables: "1万字有声书", description: "含背景音乐和章节分割" }], workSamples: [] }
  },
  { email: "demo_dev4@aiug.local", title: "AI 自动化脚本开发", content: "帮你开发 AI 自动化工作流。\n\n## 能做什么\n- 自动化数据处理\n- AI 批量内容生成\n- API 对接和集成\n- 定时任务脚本\n\n## 技术栈\nPython / Node.js / n8n / Make", tags: ["自动化", "脚本", "开发"],
    service: { category: "outsource", summary: "定制AI自动化脚本和工作流", packages: [{ name: "简单脚本", price: 300, deliveryDays: 3, deliverables: "脚本+使用文档", description: "单一功能自动化" }, { name: "完整方案", price: 800, deliveryDays: 7, deliverables: "完整系统+部署+维护1月", description: "多步骤自动化流程" }], workSamples: [] }
  },
  { email: "demo_dev5@aiug.local", title: "AI 课件制作", content: "用 AI 快速制作精美课件。\n\n## 服务\n- PPT 自动生成\n- 配图和插画\n- 知识点思维导图\n- 练习题生成\n\n## 适合\n- 教师备课\n- 培训讲师\n- 企业内训", tags: ["课件", "PPT", "教育"],
    service: { category: "teaching", summary: "AI辅助快速制作精美教学课件", packages: [{ name: "单课件", price: 80, deliveryDays: 2, deliverables: "1份PPT(20页内)", description: "含配图和排版" }, { name: "系列课件", price: 300, deliveryDays: 7, deliverables: "5份PPT+思维导图", description: "系列课程全套" }], workSamples: ["https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400"] }
  },
  { email: "demo_dev6@aiug.local", title: "短视频 AI 剪辑", content: "AI 辅助短视频后期制作。\n\n## 服务\n- 自动剪辑（去口头禅/停顿）\n- AI 字幕+翻译\n- 封面图生成\n- 背景音乐匹配\n\n## 交付\n- 成品视频文件\n- 字幕文件\n- 2次免费修改", tags: ["短视频", "剪辑", "后期"],
    service: { category: "outsource", summary: "AI辅助短视频剪辑和后期制作", packages: [{ name: "单条", price: 50, deliveryDays: 1, deliverables: "成品视频+字幕", description: "5分钟内视频" }, { name: "月度", price: 500, deliveryDays: 30, deliverables: "15条视频剪辑", description: "长期合作优惠" }], workSamples: ["https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400"] }
  },
];

// 社区帖子数据（含图片/视频）
const COMMUNITY_POSTS = [
  { email: "demo_dev1@aiug.local", title: "用 ComfyUI 生成的一组赛博朋克风格图片", content: "最近调了一套赛博朋克风格的工作流，分享一下效果。\n\n用的是 SDXL + ControlNet，加了一些自定义的 LoRA。整体色调偏蓝紫，霓虹灯效果拉满。\n\n大家觉得怎么样？有想要工作流的可以评论区留言。", images: ["https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600", "https://images.unsplash.com/photo-1515630278258-407f66498911?w=600", "https://images.unsplash.com/photo-1563089145-599997674d42?w=600"], tags: ["ComfyUI", "赛博朋克", "AI绘画"], likeCount: 89, viewCount: 1200 },
  { email: "demo_dev2@aiug.local", title: "分享一个免费的 AI 抠图方案", content: "试了很多抠图工具，最后发现 SAM2 + 简单的前端界面就够用了。\n\n## 方案\n1. 用 Meta 的 SAM2 模型做分割\n2. 前端用 Canvas 做交互\n3. 支持点击选择/框选\n\n效果比很多收费工具都好，而且完全本地运行。代码已开源，链接在评论区。", images: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"], tags: ["抠图", "SAM2", "开源"], likeCount: 156, viewCount: 2300 },
  { email: "demo_dev3@aiug.local", title: "GPT-4o 的语音功能太强了", content: "刚体验了 GPT-4o 的实时语音对话，延迟低到感觉不到，而且能听出情感变化。\n\n试了几个场景：\n- 英语口语练习 → 会纠正发音\n- 模拟面试 → 追问很到位\n- 讲故事 → 语调变化自然\n\n感觉 AI 语音助手真的要替代很多场景了。大家有什么有趣的玩法吗？", images: [], tags: ["GPT-4o", "语音", "体验"], likeCount: 234, viewCount: 3400 },
  { email: "demo_dev4@aiug.local", title: "我用 Cursor 三天写了一个完整的 SaaS", content: "不是标题党，真的三天从零到上线。\n\n## 技术栈\n- Next.js 14 + Tailwind\n- Supabase 数据库\n- Stripe 支付\n- Vercel 部署\n\n## 心得\nCursor 的 Composer 功能太猛了，基本上描述需求就能生成 80% 的代码。剩下 20% 主要是调试和业务逻辑微调。\n\n三天时间分配：\n- Day 1: 架构设计 + 核心功能\n- Day 2: 支付 + 用户系统\n- Day 3: 优化 + 部署上线\n\n有问题评论区问我。", images: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600", "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600"], tags: ["Cursor", "SaaS", "独立开发"], likeCount: 312, viewCount: 5600 },
  { email: "demo_dev5@aiug.local", title: "AI 学习路线图分享（2024版）", content: "整理了一份 AI 学习路线图，适合零基础入门。\n\n## 阶段一：基础（2周）\n- Python 基础语法\n- NumPy / Pandas\n\n## 阶段二：机器学习（4周）\n- 线性回归 / 逻辑回归\n- 决策树 / 随机森林\n- Scikit-learn 实战\n\n## 阶段三：深度学习（6周）\n- 神经网络基础\n- CNN / RNN / Transformer\n- PyTorch 实战\n\n## 阶段四：应用（持续）\n- LLM 应用开发\n- RAG / Agent\n- 部署和优化\n\n每个阶段都附了推荐资源，需要的留言。", images: [], tags: ["学习路线", "入门", "教程"], likeCount: 445, viewCount: 8900 },
  { email: "demo_dev6@aiug.local", title: "Sora 生成的视频效果对比", content: "拿到了 Sora 的测试资格，和 Runway Gen-3、Pika 做了个对比。\n\n## 测试 Prompt\n\"A cat walking on a beach at sunset, cinematic, 4K\"\n\n## 结论\n- Sora: 画质最好，运动最自然，但生成慢\n- Runway: 速度快，质量中等\n- Pika: 最快，但画质一般\n\n详细对比视频在下面，大家觉得哪个效果最好？", images: ["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600"], tags: ["Sora", "视频生成", "对比"], likeCount: 278, viewCount: 4200 },
];

export async function POST(req: Request) {
  // 临时: 支持 secret header 认证
  const seedSecret = req.headers.get("x-seed-secret");
  if (seedSecret !== "aiug-seed-2024-temp") {
    try {
      await requireAdmin();
    } catch (e: any) {
      if (e?.message === "UNAUTHENTICATED") return NextResponse.json({ error: "请先登录" }, { status: 401 });
      return NextResponse.json({ error: "仅管理员可执行" }, { status: 403 });
    }
  }

  const pwd = await bcrypt.hash("demo123", 10);
  const results: Record<string, number> = { apps: 0, skills: 0, users: 0, categories: 0, communityPosts: 0, comments: 0 };

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

  // 创建技能帖子（含 Service 记录）
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
        service: {
          create: {
            category: skill.service.category,
            summary: skill.service.summary,
            packages: JSON.stringify(skill.service.packages),
            workSamples: JSON.stringify(skill.service.workSamples),
            paymentChannels: JSON.stringify(["wechat", "alipay"]),
            contactInfo: "微信联系，登录后可见",
            status: "open",
            orderCount: Math.floor(Math.random() * 20) + 3,
          },
        },
      },
    });
    results.skills++;
  }

  // 创建社区帖子（含图片）
  for (const cp of COMMUNITY_POSTS) {
    const user = await prisma.user.findUnique({ where: { email: cp.email } });
    if (!user) continue;

    const existing = await prisma.post.findFirst({ where: { title: cp.title, authorId: user.id } });
    if (existing) continue;

    const post = await prisma.post.create({
      data: {
        authorId: user.id, type: "text", status: "published",
        title: cp.title, content: cp.content,
        images: cp.images.length > 0 ? JSON.stringify(cp.images) : null,
        cover: cp.images[0] || null,
        tags: JSON.stringify(cp.tags),
        likeCount: cp.likeCount,
        commentCount: 3,
        viewCount: cp.viewCount,
      },
    });
    results.communityPosts = (results.communityPosts || 0) + 1;

    // 给每个帖子加几条评论
    const allUsers = await prisma.user.findMany({ where: { email: { startsWith: "demo_dev" } }, take: 6 });
    const comments = [
      "效果不错，能分享一下参数吗？",
      "太强了，收藏了！",
      "请问这个对显卡有什么要求？",
      "学到了，感谢分享",
      "有没有视频教程？想跟着学",
      "这个思路很好，我也试试",
    ];
    const shuffled = comments.sort(() => Math.random() - 0.5);
    const commentUsers = allUsers.filter(u => u.id !== user.id).slice(0, 3);
    for (let i = 0; i < Math.min(3, commentUsers.length); i++) {
      await prisma.comment.create({
        data: {
          postId: post.id,
          authorId: commentUsers[i].id,
          content: shuffled[i],
        },
      });
    }
    results.comments = (results.comments || 0) + 3;
  }

  return NextResponse.json({ ok: true, ...results });
}