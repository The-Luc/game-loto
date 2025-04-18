// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import prettierConfig from 'eslint-config-prettier'; // Import prettier config
import globals from 'globals'; // Import globals library

export default tseslint.config(
  {
    // Global ignores - Applied first
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.next/**',
      '.turbo/**',
      'coverage/**', // Added common coverage folder
      '**/*.config.js',
      '**/*.config.cjs',
      '**/*.d.ts',
      'eslint.config.js', // Ignore this config file itself
      '.eslintrc.cjs.bak', // Ignore the backup file
      'prisma/generated/**', // Ignore prisma generated client
    ],
  },

  // Base ESLint recommended config
  eslint.configs.recommended,

  // TypeScript configurations
  ...tseslint.configs.recommended,

  // React configurations (applied to TS/TSX files)
  {
    files: ['**/*.{ts,tsx}'],
    ...reactRecommended,
    languageOptions: {
      ...reactRecommended.languageOptions,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        // Use globals library for browser environment
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactRecommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+ JSX transform
      'react/prop-types': 'off', // Disable prop-types as we use TypeScript
    },
  },

  // React Hooks configurations (applied to TS/TSX files)
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error', // Kept from original config
      'react-hooks/exhaustive-deps': 'warn', // Kept from original config
    },
  },

  // Next.js configurations (applied to TS/TSX files)
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },

  // Configuration for JS/CJS files (e.g., config files, scripts)
  {
    files: ['**/*.{js,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node, // Use globals library for Node.js environment
      },
    },
    rules: {
      // Add specific rules for JS/CJS if needed
    },
  },

  // Custom rule overrides (applied globally after other configs)
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Kept from original config
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Kept from original config
      // Add any other global overrides if necessary
    },
  },

  // Prettier config MUST be last to override other style rules
  prettierConfig
);
