// api/rampage-chat.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const N8N_WEBHOOK_URL =
  'https://rampagesystems.app.n8n.cloud/webhook/rampage-chat';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST from the frontend
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Forward the incoming body to your n8n webhook
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Vercel gives you parsed body already
      body: JSON.stringify(req.body),
    });

    const text = await n8nResponse.text();

    // Try to return JSON if possible, otherwise just raw text
    try {
      const json = JSON.parse(text);
      res.status(n8nResponse.status).json(json);
    } catch {
      res.status(n8nResponse.status).send(text);
    }
  } catch (error) {
    console.error('Error proxying to n8n:', error);
    res.status(500).json({ error: 'Error talking to AI backend' });
  }
}
