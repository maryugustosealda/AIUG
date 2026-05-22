// 一次性脚本:给已有应用补充截图(picsum 占位)
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const presets = {
  CodeGenie: ["codegenie1", "codegenie2", "codegenie3"],
  "PicCut Pro": ["piccut1", "piccut2", "piccut3", "piccut4"],
  WriteFlow: ["writeflow1", "writeflow2", "writeflow3"],
  "VoiceClone Mini": ["voiceclone1", "voiceclone2"],
};

(async () => {
  const apps = await p.app.findMany();
  for (const a of apps) {
    if (a.screenshots) continue; // 已有截图就跳过
    const seeds = presets[a.name];
    if (!seeds) continue;
    const urls = seeds.map((s) => `https://picsum.photos/seed/${s}/1280/720`);
    await p.app.update({ where: { id: a.id }, data: { screenshots: JSON.stringify(urls) } });
    console.log(`updated screenshots for ${a.name}`);
  }
  await p.$disconnect();
})();

