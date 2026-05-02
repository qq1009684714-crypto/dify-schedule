import axios from 'axios';

// 已经帮你配置好了完整的Webhook地址
const WEBHOOK_TRIGGER_URL = 'https://trigger.ai-plugin.io/triggers/webhook/P-dbyM6Fus5G4QamaTC0yz9I';

async function run() {
  try {
    // 只需要触发Dify的工作流，推送由Dify自己完成
    console.log('正在触发Dify工作流...');
    await axios.post(WEBHOOK_TRIGGER_URL, {});
    console.log('工作流触发成功，Dify正在自动生成并推送周报...');
  } catch (err) {
    console.error('触发出错:', err.response?.data || err.message);
    process.exit(1);
  }
}

run();
