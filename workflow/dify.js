import axios from 'axios';

// Webhook地址还是原来的
const WEBHOOK_TRIGGER_URL = 'https://trigger.ai-plugin.io/triggers/webhook/P-dbyM6Fus5G4QamaTC0yz9I';
const PUSHPLUS_TOKEN = process.env.PUSHPLUS_TOKEN;

async function run() {
  try {
    console.log('正在触发Webhook...');
    // 触发Dify的Webhook
    const workflowRes = await axios.post(WEBHOOK_TRIGGER_URL, {});
    console.log('Webhook响应:', workflowRes.data);

    // 把Webhook的响应推给你，测试能不能收到
    const pushRes = await axios.post('https://www.pushplus.plus/send', {
      token: PUSHPLUS_TOKEN,
      title: 'Webhook触发测试',
      content: `Webhook响应内容：\n${JSON.stringify(workflowRes.data)}`,
      template: 'markdown'
    });

    console.log('推送完成，PushPlus响应:', pushRes.data);
  } catch (err) {
    console.error('出错了:', err.response?.data || err.message);
    process.exit(1);
  }
}

run();
