import { retrievalService } from './src/services/retrievalService.js';

console.log('Testing classifyQueryIntent...');

const testQueries = [
  'What files are in this repository?',
  'How many files are in this repository?',
  'List all files',
  'What folders exist?',
  'Which file contains the HashMap solution for Two Sum?',
];

testQueries.forEach((q) => {
  const result = retrievalService.classifyQueryIntent(q);
  console.log(`Query: "${q}" => Intent: ${result.intent}, isManifest: ${!!result.isManifestQuery}`);
});
