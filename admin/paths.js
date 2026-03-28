const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT_DIR, 'source', '_posts');

module.exports = { ROOT_DIR, POSTS_DIR };
