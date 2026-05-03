const Parser = require('rss-parser');
const axios = require('axios');

const parser = new Parser();

// 国内10大AI/科技媒体RSS源（直接复制我之前给你的，已集成）
const RSS_SOURCES = [
  'https://www.qbitai.com/feed',
  'https://www.jiqizhixin.com/rss',
  'https://www.aixinzhi.com/rss',
  'https://www.deeptechchina.com/feed',
  'https://36kr.com/feed',
  'https://www.infoq.cn/feed',
  'https://www.tmtpost.com/feed',
  'https://www.geekpark.net/rss',
  'https://tech.sina.com.cn/rss.xml',
  'https://tech.163.com/rss'
];

// Dify API 配置
const DIFY_API_URL = 'https://api.dify.ai/v1/chat-messages';
const DIFY_API_KEY = process.env.DIFY_API_KEY;

// 推送加API配置
const PUSHPLUS_URL = 'https://www.pushplus.plus/send';
const PUSHPLUS_TOKEN = process.env.PUSHPLUS_TOKEN;

async function fetchAllRSS() {
  console.log('开始抓取所有RSS源...');
  const allArticles = [];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  for (const url of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(url);
      console.log(`成功抓取: ${feed.title}，共 ${feed.items.length} 篇文章`);
      
      feed.items.forEach(item => {
        const pubDate = new Date(item.pubDate);
        // 只保留近7天的文章
        if (pubDate >= sevenDaysAgo) {
          allArticles.push({
            title: item.title,
            content: item.contentSnippet || item.description,
            link: item.link,
            pubDate: pubDate,
            source: feed.title
          });
        }
      });
    } catch (error) {
      console.error(`抓取失败: ${url}`, error.message);
    }
  }

  console.log(`总共抓取到 ${allArticles.length} 篇近7天的文章`);
  return allArticles;
}

async function generateWeeklyReport(articles) {
  console.log('正在调用Dify生成周报...');
  
  const prompt = `
请你基于以下所有AI新闻，生成一份《本周AI圈重大事件》周报。
严格遵守以下所有要求，一条都不能违反：
1. 风格参考：https://mp.weixin.qq.com/s/uZOxiIGz-0Ta8o3XqwH02g，简洁清晰，口语化，像真人写的
2. 分类要求：按"AI新模型/工具发布"、"AI行业动态"、"AI政策监管"、"AI技术突破"、"AI融资动态"分类，某类无内容直接跳过，不要写"无"
3. 内容要求：
   - 只保留最重要的5-8个事件，不要堆砌
   - 同一事件多家媒体报道，只保留1条最权威的，自动去重
   - 每个事件用1-2句话总结
   - 每个事件结尾必须附带原文链接，格式：（原文链接：XXX）
4. 格式要求：
   - 标题：【本周AI圈重大事件（YYYY年MM月DD日-MM月DD日）】（日期自动替换为过去7天）
   - 分类标题：用"### 分类名称"格式
   - 事件开头用"- "
5. 绝对禁止：输出任何思考过程、分析逻辑、解释说明，只输出最终的周报内容！

以下是所有新闻内容：
${JSON.stringify(articles, null, 2)}
`;

  const response = await axios.post(DIFY_API_URL, {
    inputs: {},
    query: prompt,
    response_mode: 'blocking',
    user: 'github-actions'
  }, {
    headers: {
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data.answer;
}

async function sendToWechat(content) {
  console.log('正在发送到微信...');
  
  await axios.post(PUSHPLUS_URL, {
    token: PUSHPLUS_TOKEN,
    title: '📅 AI圈每周周报已送达',
    content: content,
    template: 'txt'
  });

  console.log('发送成功！');
}

async function main() {
  try {
    const articles = await fetchAllRSS();
    if (articles.length === 0) {
      console.log('本周没有新的AI新闻');
      await sendToWechat('【本周AI圈重大事件】本周无重大事件');
      return;
    }
    
    const report = await generateWeeklyReport(articles);
    await sendToWechat(report);
    console.log('全部任务完成！');
  } catch (error) {
    console.error('任务失败:', error);
    process.exit(1);
  }
}

main();
