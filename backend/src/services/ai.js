import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

function ruleBasedSuggest({ title = '', description = '' }) {
  const text = `${title} ${description}`.toLowerCase();
  let category = 'general';
  if (/(exam|mid ?term|final|assignment|homework|課|考)/.test(text)) category = 'school';
  if (/(email|reply|meeting|report|presentation|cover letter|resume)/.test(text)) category = 'work';
  if (/(buy|購買|shopping|雜貨|grocer|milk|food)/.test(text)) category = 'personal';

  // due date heuristic
  let dueDate;
  const now = new Date();
  if (/tomorrow|明天/.test(text)) {
    dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  } else if (/next week|下週/.test(text)) {
    dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
  }

  const subtasks = [];
  if (/cover letter/.test(text)) {
    subtasks.push('研究公司', '撰寫動機段', '校對與導出 PDF');
  } else if (/presentation|簡報/.test(text)) {
    subtasks.push('整理大綱', '準備投影片', '排練講稿');
  }

  return { category, dueDate, subtasks };
}

export async function suggestWithAI(input) {
  if (!OPENAI_API_KEY) {
    return ruleBasedSuggest(input);
  }

  try {
    const sys = 'You generate concise task suggestions: category (one word), optional ISO date for dueDate, and 3-5 subtasks as short phrases. Reply JSON only.';
    const user = `Title: ${input.title}\nDescription: ${input.description}\nOutput JSON with keys: category, dueDate (optional, ISO), subtasks (string array).`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user }
        ],
        temperature: 0.2
      })
    });
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    return {
      category: parsed.category || 'general',
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : undefined,
      subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks : []
    };
  } catch (e) {
    return ruleBasedSuggest(input);
  }
}


