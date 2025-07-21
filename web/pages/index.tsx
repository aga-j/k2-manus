import { useState } from 'react';
export default function Home() {
  const [task, setTask] = useState('');
  const [log, setLog] = useState('');
  const run = async () => {
    setLog('');
    const res = await fetch('/api/run', { method: 'POST', body: JSON.stringify({ task }) });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      setLog(prev => prev + decoder.decode(value));
    }
  };
  return (
    <main style={{ fontFamily: 'sans-serif', margin: 40 }}>
      <h1>K2-Manus Lite 🚀</h1>
      <textarea value={task} onChange={e => setTask(e.target.value)} rows={3} cols={60} />
      <br />
      <button onClick={run}>Run Task</button>
      <pre style={{ background: '#f6f8fa', padding: 16, whiteSpace: 'pre-wrap' }}>{log}</pre>
    </main>
  );
}
