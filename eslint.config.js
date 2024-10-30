import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import typescript from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', 'dist/**']
  },
  eslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescript,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: { ...globals.node }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'prettier': prettier
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'prettier/prettier': 'error'
    }
  }
];
