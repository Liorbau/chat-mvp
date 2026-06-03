import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    rules: {
      curly: ['error', 'all'],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // The UI layer must not reach into the auth/session singleton directly.
    // Manage the session via the apiClient (login/logout) and pass identity
    // down as props.
    files: ['src/App.tsx', 'src/**/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/auth/authSession'],
              message:
                'UI must not import authSession directly. Use the apiClient (login/logout) and pass the current user down as props.',
            },
          ],
        },
      ],
    },
  },
])
