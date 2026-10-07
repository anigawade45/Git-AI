import { aiEngine } from './src/services/aiEngine.js';

const testPrompts = [
  'Which file contains the HashMap solution for Two Sum?',
  'Where is the MongoDB connection configured?',
  'How does authentication work?',
  'Show me the Binary Search implementation',
  'Does this repo contain a Trie?',
  'Explain the repository architecture',
];

console.log('--- Testing Semantic Title Generator ---\n');

for (const p of testPrompts) {
  const title = aiEngine.cleanRuleBasedTitle(p);
  console.log(`Prompt: "${p}"`);
  console.log(`Result: "${title}"\n`);
}
