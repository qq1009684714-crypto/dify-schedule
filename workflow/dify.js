const axios = require('axios');

// 👇 把这里替换成你刚才从Dify复制的Webhook完整URL
const WEBHOOK_TRIGGER_URL = 'https://trigger.ai-plugin.io/triggers/webhook/P-dbyM6Fus5G4QamaTC0yz9I';
const PUSHPLUS_TOKEN = process.env.PUSHPLUS_TOKEN;

async function run() {
  try {
    // 1. 调用Webhook，触发你的Dify工作流
    console.log('正在触发Dify工作流...');
    const workflowRes = await axios.post(WEBHOOK_TRIGGER_URL, {});
    console.log('工作流执行完成，结果:', workflowRes.data);

    // 2. 把工作流的结果推送给PushPlus
    console.log('正在推送结果到PushPlus...');
    const pushRes = await axios.post('https://www.pushplus.plus/send', {
      token: PUSHPLUS_TOKEN,
      title: '本周技术周报',
      content: workflowRes.data,
      template: 'markdown'
    });

    console.log('推送成功！PushPlus响应:', pushRes.data);
  } catch (err) {
    console.error('执行出错:', err.response?.data || err.message);
    process.exit(1);
  }
}

run();
