#jsx

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Mermaid } from 'mermaid-react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3000');

export function RootMap({ traceId }) {
  const [seed, setSeed] = useState('');
  const { data: roots } = useQuery({
    queryKey: ['roots', traceId],
    queryFn: () => axios.get(`/prompts/${traceId}`).then(res => res.data.roots),
  });

  const deconstructMutation = useMutation({
    mutationFn: (newSeed) => axios.post('/parse/seed-to-roots', { seed: newSeed }),
    onSuccess: (data) => setSeed(data.roots[0]?.branch || ''), // Cascade UI
  });

  const reconstructMutation = useMutation({
    mutationFn: () => axios.post('/synthesize/roots-to-seed', { traceId }),
    onSuccess: (data) => alert(`Reconstructed Seed: ${data.seed}`),
  });

  // Live collab: Socket emits root drags
  const handleBranchEdit = (step, newBranch) => {
    socket.emit('updateRoot', { traceId, step, newBranch });
  };

  const diagram = roots ? `
    graph TD
      S[Seed: ${seed}] --> R1[Step 1: ${roots[0]?.branch}]
      R1 --> R2[Step 2: ${roots[1]?.branch}]
      ${roots.map((r, i) => `R${i+1} --> R${i+2}[Step ${i+2}: ${r.branch}]`).join('\n')}
  ` : '';

  return (
    <div className="root-void">
      <input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="Plant Seed..." />
      <button onClick={() => deconstructMutation.mutate(seed)}>Fractal Down</button>
      <button onClick={reconstructMutation.mutate}>Weave Up</button>
      <Mermaid chart={diagram} /> {/* Interactive tree */}
      {roots?.map((root, i) => (
        <div key={i}>
          <input value={root.branch} onChange={(e) => handleBranchEdit(i, e.target.value)} />
        </div>
      ))}
    </div>
  );
}
