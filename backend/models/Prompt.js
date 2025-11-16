#javascript

const mongoose = require('mongoose');
const PromptSchema = new mongoose.Schema({
  seed: { type: String, required: true }, // Original high-level concept
  roots: [{ step: Number, branch: String, prompt: String, type: String }], // Fractal branches
  metadata: { owner: String, price: Number, analytics: { deconstructions: Number } }
});
module.exports = mongoose.model('Prompt', PromptSchema);
