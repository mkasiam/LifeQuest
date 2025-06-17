// Vercel serverless function entry point
const path = require('path');

// Set the correct path for imports in Vercel environment
process.chdir(path.join(__dirname, '..'));

// Import and export the Express app
module.exports = require('../server/index.ts');