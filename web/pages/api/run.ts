import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { task } = req.body;
  const py = spawn('python', ['-u', 'agent/orchestrator.py', task], { cwd: process.cwd() });
  py.stdout.on('data', (chunk) => res.write(chunk));
  py.stderr.on('data', (chunk) => res.write(chunk));
  py.on('close', () => res.end());
}
