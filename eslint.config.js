import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.vite/**',
      'backend/drizzle/**',
      'backend/data/**',
      'backend/logs/**',
      'artifacts/**',
      '.agents/**',
      '.codex/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    extends: [js.configs.recommended],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['frontend/src/**/*.{ts,tsx}'],
    extends: [
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: { globals: globals.browser },
    settings: { react: { version: 'detect' } },
    rules: {
      // TypeScript checks component props; React uses the automatic JSX runtime.
      'react/prop-types': 'off',
    },
  },
  {
    files: [
      'backend/**/*.{js,mjs,cjs,ts}',
      'scripts/**/*.{js,mjs,cjs}',
      '*.{js,mjs,cjs,ts}',
      'frontend/*.{js,mjs,cjs,ts}', 
    ],
    languageOptions: { globals: globals.node },
  },
  // Keep formatting in Prettier and disable conflicting lint rules.
  prettier,
);
