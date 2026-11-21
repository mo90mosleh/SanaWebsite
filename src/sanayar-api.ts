import { assetPath } from './assets';
import type { Answer } from './sanayar-knowledge';
import { readSSE } from './sanayar-stream';
export type ChatTurn = { text: string; user?: boolean };
export type LiveAnswer = Answer & { mode?: 'gemini' | 'guide' };
export type StreamProgress = { text?: string; links?: Answer['links']; mode?: 'gemini' | 'guide' };
function safeLinks(links: unknown): Answer['links'] {
  if (!Array.isArray(links)) return [];
  return links.filter(l => typeof l?.label === 'string' && typeof l?.href === 'string' && (/^#\/(devices(?:\/[a-z0-9-]+)?|supplies\/(poct|ortanes)|services|contact|login|customer\/(supplies|orders|tickets))$/.test(l.href) || /^\/product-assets\/[a-zA-Z0-9/_.-]+\.pdf$/.test(l.href)));
}
export function compactHistory(history: ChatTurn[]) {
  const turns: {role: string; text: string}[] = []; let bytes = 0;
  for (const m of history.slice(-6).reverse()) {
    const text = m.text.slice(0,1000); if (!text.trim()) continue;
    const size = new TextEncoder().encode(text).length;
    if (bytes + size > 7500) break;
    bytes += size; turns.unshift({role:m.user?'user':'model',text});
  }
  return turns;
}
export async function askSanayar(question: string, history: ChatTurn[], signal: AbortSignal, onProgress?: (progress: StreamProgress) => void): Promise<LiveAnswer> {
  // Pages is static; use the existing Worker for its server-only assistant API.
  const endpoint = import.meta.env.BASE_URL === '/SanaWebsite/'
    ? 'https://sanawebsite.mo90mosleh.workers.dev/api/sanayar/chat'
    : assetPath('/api/sanayar/chat');
  const response = await fetch(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
    body: JSON.stringify({ question, history: compactHistory(history), stream: true }),
  });
  if (!response.ok) {
    const error = await response.json().catch(()=>({}));
    throw new Error(error.error === 'provider_quota' ? 'SANAYAR_PROVIDER_QUOTA' : `SANAYAR_${response.status}`);
  }
  if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
    if (!response.body) throw new Error('SANAYAR_EMPTY');
    let text = '', links: Answer['links'] = [], complete = false;
    let mode: 'gemini' | 'guide' = 'gemini';
    for await (const raw of readSSE(response.body)) {
      const event = JSON.parse(raw);
      if (event.type === 'error') throw new Error('SANAYAR_STREAM');
      if (event.type === 'meta') { links = safeLinks(event.links); mode = event.mode === 'guide' ? 'guide' : 'gemini'; }
      if (event.type === 'delta' && typeof event.text === 'string') { text += event.text; onProgress?.({text,mode}); }
      if (event.type === 'done') { complete = true; links = safeLinks(event.links ?? links); }
    }
    if (!text.trim() || !complete) throw new Error('SANAYAR_INCOMPLETE');
    return {text,links,mode};
  }
  const data = await response.json();
  if (typeof data.text !== 'string' || !data.text.trim()) throw new Error('SANAYAR_EMPTY');
  // Fixed guidance also appears progressively; no fabricated model connection.
  let text = '';
  for (const part of data.text.match(/.{1,22}/gs) || []) {
    if (signal.aborted) throw new Error('SANAYAR_ABORTED');
    text += part; onProgress?.({text,mode:'guide'});
    await new Promise(resolve=>setTimeout(resolve,15));
  }
  return { text: data.text, links: safeLinks(data.links), mode: data.mode === 'gemini' ? 'gemini' : 'guide' };
}
