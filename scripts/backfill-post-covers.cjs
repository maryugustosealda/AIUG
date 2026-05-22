// 给文本帖加 cover/images 占位图,让广场更直观。已有图的会跳过。
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const presets = {
  // 标题关键词 -> picsum seed
  "ComfyUI": ["comfyui1", "comfyui2", "comfyui3"],
  "新手提问": ["question1"],
  "AI 漫画": ["comic1", "comic2"],
  "AI 视频": ["video1"],
  "Stable Diffusion": ["sd1", "sd2", "sd3"],
};

(async () => {
  const posts = await p.post.findMany({ where: { type: { not: "app" } } });
  for (const post of posts) {
    if (post.cover || post.images) continue;
    let seeds = null;
    for (const key of Object.keys(presets)) {
      if (post.title.includes(key)) { seeds = presets[key]; break; }
    }
    if (!seeds) {
      // 默认按 id 哈希一张图
      seeds = [`post-${post.id.slice(0, 6)}`];
    }
    const urls = seeds.map((s) => `https://picsum.photos/seed/${s}/1200/675`);
    await p.post.update({
      where: { id: post.id },
      data: { cover: urls[0], images: urls.length > 1 ? JSON.stringify(urls) : null },
    });
    console.log(`updated ${post.title} -> ${urls.length} 张图`);
  }
  await p.$disconnect();
})();

