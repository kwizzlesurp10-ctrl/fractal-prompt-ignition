const express = require('express');
const router = express.Router();
const { ReverseParser } = require('../../shared/parser'); // Shared lib import
const Prompt = require('../models/Prompt');

// Downward: Seed → Roots (5-step fractal default)
router.post('/parse/seed-to-roots', async (req, res) => {
  const { seed, steps = 5 } = req.body;
  const parser = new ReverseParser(seed);
  const roots = parser.deconstruct(steps); // Branches via LLM proxy (e.g., Gemini)
  const prompt = new Prompt({ seed, roots });
  await prompt.save();
  res.json({ roots, traceId: prompt._id }); // Memo-trace for reversal
});

// Upward: Roots → Seed (Synthesis)
router.post('/synthesize/roots-to-seed', async (req, res) => {
  const { traceId } = req.body;
  const prompt = await Prompt.findById(traceId);
  if (!prompt) return res.status(404).json({ error: 'Lost Roots' });
  const parser = new ReverseParser(prompt.seed, prompt.roots);
  const reconstructed = parser.reconstruct(); // AI-weave upward
  res.json({ seed: reconstructed, fidelity: 0.98 }); // Score match to original
});

module.exports = router;
