import { defaultModel, supportedModels } from '@configs';
import type { APIRoute } from 'astro';

// read apiKey from env/process.env
const apiKey = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

// use proxy in local env
const baseURL =
  process.env.NODE_ENV === 'development'
    ? 'gptgenius-proxy.zeabur.app/proxy'
    : 'api.openai.com';

export const post: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { messages } = body;
  let { key, model } = body;

  key = key || apiKey;
  model = model || defaultModel;

  if (!key) {
    return new Response(JSON.stringify({ msg: 'No API key provided' }), {
      status: 400,
    });
  }

  if (!supportedModels.includes(model)) {
    return new Response(
      JSON.stringify({ msg: `Not supported model ${model}` }),
      {
        status: 400,
      }
    );
  }

  try {
    const completion = await fetch(`https://${baseURL}/v1/chat/completions`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      method: 'POST',
      body: JSON.stringify({
        model,
        messages,
      }),
    });
    const data = await completion.json();

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ msg: e?.message || e?.stack || e }), {
      status: 500,
    });
  }
};
