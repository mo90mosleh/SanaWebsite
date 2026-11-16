/** Parse SSE across arbitrary network and UTF-8 boundaries. */
export async function* readSSE(stream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = stream.getReader(), decoder = new TextDecoder();
  let buffer = '';
  const data = (event: string) => event.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).replace(/^ /, '')).join('\n');
  try {
    while (true) {
      const {value, done} = await reader.read();
      buffer = (buffer + (done ? decoder.decode() : decoder.decode(value, {stream:true}))).replace(/\r\n/g, '\n');
      if (buffer.length > 262144) throw new Error('STREAM_EVENT_TOO_LARGE');
      let end: number;
      while ((end = buffer.indexOf('\n\n')) !== -1) {
        const event = data(buffer.slice(0,end)); buffer = buffer.slice(end+2);
        if (event) yield event;
      }
      if (done) { const last = data(buffer); if(last) yield last; break; }
    }
  } finally { await reader.cancel().catch(()=>{}); reader.releaseLock(); }
}
