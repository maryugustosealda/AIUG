// 一次性灌入示例技能服务
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const seeds = [
  {
    authorEmail: "alice@aiug.local",
    title: "ComfyUI 商业海报实战:7 天从零到接单",
    summary: "教你 7 天上手 ComfyUI,从工作流搭建到商业海报交付",
    category: "teaching",
    content: `# 课程大纲

## 7 天速成
- Day 1-2: ComfyUI 基础节点与工作流逻辑
- Day 3-4: SDXL + ControlNet 出商业级效果
- Day 5: Lora 训练入门
- Day 6: 海报版式与文字处理
- Day 7: 接单流程与定价策略

## 你能学到
- 完整工作流文件(可商用)
- 海量素材包
- 接单话术与避坑指南`,
    workSamples: [
      "https://picsum.photos/seed/teach1a/1280/720",
      "https://picsum.photos/seed/teach1b/1280/720",
      "https://picsum.photos/seed/teach1c/1280/720",
    ],
    packages: [
      { name: "基础版", price: 199, deliveryDays: 0, deliverables: "8 节录播视频 + 工作流文件", description: "适合零基础" },
      { name: "标准版", price: 499, deliveryDays: 0, deliverables: "录播 + 1 次 1v1 答疑(1h)+ 素材包", description: "推荐" },
      { name: "旗舰版", price: 1299, deliveryDays: 0, deliverables: "录播 + 4 次 1v1 答疑 + 接单指导 + 私域社群", description: "想接单变现" },
    ],
    paymentChannels: ["wechat", "alipay", "afdian"],
    contactInfo: "微信:`comfyui_teacher`(备注 AIUG)\n\n爱发电:https://afdian.net/example\n\n下单流程:加微信 → 选套餐 → 付款 → 拉群发资料",
    tags: ["ComfyUI", "教程", "商业海报"],
  },
  {
    authorEmail: "bob@aiug.local",
    title: "AI 数字人短视频代做(口播/带货)",
    summary: "30 秒口播视频代做,人物声音皆可定制",
    category: "outsource",
    content: `# 我能交付什么

- **30~60s 数字人口播视频**,真人质感,适合知识科普、产品介绍
- 支持中英双语,可指定声音风格(沉稳/活泼/磁性)
- 提供 4K 成片 + 字幕文件

## 适合谁
- 自媒体博主想批量出口播
- 商家做带货脚本视频
- 课程/培训机构

## 不适合谁
- 需要真人出镜情感表演
- 音乐 MV / 复杂运镜`,
    workSamples: [
      "https://picsum.photos/seed/outsource1a/1280/720",
      "https://picsum.photos/seed/outsource1b/1280/720",
    ],
    packages: [
      { name: "30 秒标准款", price: 99, deliveryDays: 2, deliverables: "1 条 30s 视频 + 字幕,2 次小修", description: "" },
      { name: "60 秒进阶款", price: 199, deliveryDays: 3, deliverables: "1 条 60s 视频 + 字幕 + B-roll 素材,3 次修改", description: "" },
      { name: "10 条月套餐", price: 1500, deliveryDays: 30, deliverables: "10 条视频(30-60s),专属客服,无限次小修", description: "适合长期博主" },
    ],
    paymentChannels: ["wechat", "alipay", "xianyu"],
    contactInfo: "**微信下单**:`ai_video_studio`\n\n**闲鱼店铺**:搜「AI 数字人代做」\n\n下单需提供:脚本文案 + 期望声音风格,无脚本可加 50 元代写。",
    tags: ["数字人", "短视频", "口播", "代做"],
  },
  {
    authorEmail: "carol@aiug.local",
    title: "Stable Diffusion Lora 训练定制",
    summary: "你提供素材,我帮你训练专属 Lora,角色/画风/产品都行",
    category: "training",
    content: `## 服务说明

提供素材即可,我负责打标、训练、调参,直到出图满意为止。

### 适用场景
- 角色一致性(IP / 自创角色)
- 画风迁移(指定画师/风格)
- 产品/物品(商品摄影、电商主图)

### 你需要提供
- 至少 15 张高质量参考图
- 文字描述训练目标

### 我交付什么
- Lora 文件(.safetensors)
- 出图测试 30 张
- 推荐参数与 prompt 模板`,
    workSamples: [
      "https://picsum.photos/seed/lora1a/1280/720",
      "https://picsum.photos/seed/lora1b/1280/720",
      "https://picsum.photos/seed/lora1c/1280/720",
      "https://picsum.photos/seed/lora1d/1280/720",
    ],
    packages: [
      { name: "标准 Lora", price: 299, deliveryDays: 5, deliverables: "1 个 Lora 文件 + 30 张测试图 + 参数说明", description: "" },
      { name: "精修 Lora", price: 699, deliveryDays: 10, deliverables: "多次迭代,最多 5 轮调整,直到满意", description: "推荐" },
      { name: "企业定制", price: 0, deliveryDays: 0, deliverables: "面议,可签合同,可签 NDA", description: "适合品牌方" },
    ],
    paymentChannels: ["wechat", "alipay", "contact"],
    contactInfo: "微信:`lora_trainer`\n\n下单流程:加好友说明需求 → 我评估给报价 → 你付定金 → 训练 → 验收 → 尾款",
    tags: ["Lora", "训练", "Stable Diffusion"],
  },
];

(async () => {
  for (const s of seeds) {
    const author = await p.user.findUnique({ where: { email: s.authorEmail } });
    if (!author) { console.log(`skip: ${s.authorEmail} not found`); continue; }
    const exists = await p.post.findFirst({ where: { type: "service", title: s.title, authorId: author.id } });
    if (exists) { console.log(`skip: ${s.title} already exists`); continue; }
    await p.post.create({
      data: {
        authorId: author.id, type: "service",
        title: s.title, content: s.content,
        tags: JSON.stringify(s.tags),
        status: "published",
        service: {
          create: {
            category: s.category, summary: s.summary,
            workSamples: JSON.stringify(s.workSamples),
            packages: JSON.stringify(s.packages),
            paymentChannels: JSON.stringify(s.paymentChannels),
            contactInfo: s.contactInfo,
          },
        },
      },
    });
    console.log(`created: ${s.title}`);
  }
  await p.$disconnect();
})();

