// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['node_modules/', 'test-results/', 'playwright-report/', 'blob-report/', 'playwright/.cache/'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Enforce conventions from .claude/conventions/tests.md
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-skipped-test': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-raw-locators': 'error',
      'playwright/no-nth-methods': 'warn',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/missing-playwright-await': 'error',
      'playwright/no-useless-await': 'error',
    },
  },
  prettier,
);
