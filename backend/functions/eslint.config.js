import js from '@eslint/js';
import globals from 'globals';

export default [
  // Legacy CommonJS reference files, intentionally not exported from index.js
  { ignores: ['node_modules/**', 'src/seedOnlinePackages.js', 'src/seedPackagesFunction.js', 'src/initializeAdminClaim.js'] },
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { ...globals.node } },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-empty': 'warn',
      'no-useless-escape': 'warn',
    },
  },
];
