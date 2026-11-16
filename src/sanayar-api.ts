import { assetPath } from './assets';
import type { Answer } from './sanayar-knowledge';
export type ChatTurn = { text: string; user?: boolean };
export async function askSanayar(question: string, history: ChatTurn[], signal: AbortSignal): Promise<Answer> {
  const response = await fetch(assetPath('/api/sanayar/chat'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
    body: JSON.stringify({ question, history: history.slice(-6).map(m => ({ role: m.user ? 'user' : 'model', text: m.text.slice(0, 1500) })) }),
  });
  if (!response.ok) throw new Error(`SANAYAR_${response.status}`);
  const data = await response.json();
  if (typeof data.text !== 'string' || !data.text.trim()) throw new Error('SANAYAR_EMPTY');
  return { text: data.text, links: Array.isArray(data.links) ? data.links.filter((l: {label?: unknown; href?: unknown}) => typeof l.label === 'string' && typeof l.href === 'string' && (l.href.startsWith('#/') || (l.href.startsWith('/product-assets/') && l.href.endsWith('.pdf')))) : [] };
}
