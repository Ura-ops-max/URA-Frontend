import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // The codebase intentionally uses `any` in many API/response boundaries;
      // enforcing strict typing everywhere is out of scope and offers little
      // value here. Disabled rather than left as noise.
      '@typescript-eslint/no-explicit-any': 'off',
      // Fires on files that export helpers/constants next to a component. This
      // only affects Fast Refresh DX in dev, not the build — keep as a hint.
      'react-refresh/only-export-components': 'warn',
      // Unused vars are worth cleaning, but allow the `_`-prefix escape hatch,
      // ignore rest-sibling omissions (`const { drop, ...rest } = obj`), and
      // don't flag unused `catch (err)` bindings.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          caughtErrors: 'none',
        },
      ],
    },
  },
]);
