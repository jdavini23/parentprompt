module.exports = {
  // Run ESLint on JS, TS, JSX, and TSX files
  '**/*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  // Format JSON, CSS, and MD files with Prettier
  '**/*.{json,css,md}': ['prettier --write'],
};
