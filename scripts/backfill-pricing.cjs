// 给现有应用补付费方式 + 详细说明,方便看效果
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const presets = {
  "PicCut Pro": {
    pricingMode: "trial", price: 49, billingCycle: "oneTime",
    trialDesc: "试用版无水印,每天处理 30 张",
    paymentChannels: ["wechat", "alipay", "afdian"],
    pricingDetail: `**完整版 49 元一次买断**,激活后无次数限制。

**付款方式**

- 微信扫描下方二维码,备注您的邮箱
- 支付宝转账至 13812345678,备注邮箱
- 也可在 [爱发电](https://afdian.net/example) 赞助 49 元

付款后 24 小时内会把激活码发到邮箱,有问题加微信 \`piccut_dev\` 留言。`,
  },
  WriteFlow: {
    pricingMode: "paid", price: 99, billingCycle: "oneTime",
    paymentChannels: ["wechat", "xianyu", "contact"],
    pricingDetail: `**99 元一次买断,终身可用**,后续大版本免费升级。

**3 种购买方式**

1. 微信扫码 → 备注「WriteFlow」+ 您的邮箱
2. 闲鱼搜索店铺「WriteFlow 官方」拍下
3. 加微信 \`writeflow2024\` 私聊

发货周期一般 30 分钟内,白天回复较快。`,
  },
  CodeGenie: {
    pricingMode: "free",
  },
  "VoiceClone Mini": {
    pricingMode: "free",
  },
};

(async () => {
  const apps = await p.app.findMany();
  for (const a of apps) {
    const cfg = presets[a.name];
    if (!cfg) continue;
    const data = {
      pricingMode: cfg.pricingMode,
      price: cfg.price ?? 0,
      billingCycle: cfg.billingCycle ?? null,
      trialDesc: cfg.trialDesc ?? null,
      paymentChannels: cfg.paymentChannels ? JSON.stringify(cfg.paymentChannels) : null,
      pricingDetail: cfg.pricingDetail ?? null,
    };
    await p.app.update({ where: { id: a.id }, data });
    console.log(`updated pricing for ${a.name}`);
  }
  await p.$disconnect();
})();

