/**
 * ESLint configuration templates for different linting strategies
 */

export const ESLintConfigs = {
  /**
   * Custom ESLint configuration with comprehensive rules
   */
  getCustomConfig: () => `import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: ['./tsconfig.json', './tsconfig.*.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        JSX: 'readonly',
        browser: true,
        es2021: true,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      react: react,
      'react-hooks': reactHooks,
      import: importPlugin,
      prettier: prettier,
    },
    rules: {
      // Base ESLint recommended rules
      ...js.configs.recommended.rules,
      // TypeScript rules
      ...typescriptEslint.configs.recommended.rules,
      // React rules
      ...react.configs.recommended.rules,
      // React Hooks rules
      ...reactHooks.configs.recommended.rules,
      
      // Custom rules
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': ['error'],
      'react/jsx-filename-extension': ['warn', { extensions: ['.tsx', '.jsx'] }],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      'max-len': ['warn', { code: 200 }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'consistent-return': 'error',
      'prefer-const': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'error',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-fallthrough': 'error',
      'no-implicit-coercion': 'error',
      curly: 'error',
      eqeqeq: 'error',
      'no-const-assign': 'error',
      'no-multiple-empty-lines': 'error',
      camelcase: 'error',
      'no-var': 'error',
      'no-duplicate-imports': 'error',
      'padding-line-between-statements': 'error',
      'complexity': ['error', { max: 10 }],
      
      // Import rules
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      'import/no-unresolved': 'off',
      
      // React specific rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      
      // Prettier rules
      'prettier/prettier': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json', './tsconfig.*.json'],
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
  {
    files: ['src/setupTests.js'],
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: './',
      },
    },
  },
];`,

  /**
   * Airbnb ESLint configuration with accessibility and import rules
   */
  getAirbnbConfig: () => `import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: ['./tsconfig.json', './tsconfig.*.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      react: react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
      prettier: prettier,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      'import/no-unresolved': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prettier/prettier': 'error',
      'react/function-component-definition': [
        2,
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json', './tsconfig.*.json'],
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
];`,

  /**
   * Standard ESLint configuration with basic TypeScript and React support
   */
  getStandardConfig: () => `import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: ['./tsconfig.json', './tsconfig.*.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      react: react,
      'react-hooks': reactHooks,
      prettier: prettier,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'prettier/prettier': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];`
};

/**
 * Get ESLint configuration based on linter type
 * @param linterType - The type of linter configuration to return
 * @returns ESLint configuration string
 */
export function getEslintConfig(linterType: string): string {
  switch (linterType) {
    case "custom":
      return ESLintConfigs.getCustomConfig();
    case "airbnb":
      return ESLintConfigs.getAirbnbConfig();
    case "eslint":
    default:
      return ESLintConfigs.getStandardConfig();
  }
}

/**
 * Get dependencies for ESLint configurations
 * @param linterType - The type of linter configuration
 * @returns Object with package names and versions
 */
export function getEslintDependencies(linterType: string): { [key: string]: string } {
  const baseDeps = {
    "eslint": "^9.0.0",
    "@eslint/js": "^9.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint-plugin-react": "^7.34.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-import-resolver-typescript": "^3.6.1"
  };

  switch (linterType) {
    case "airbnb":
      return {
        ...baseDeps,
        "eslint-config-airbnb": "^19.0.4",
        "eslint-config-airbnb-typescript": "^18.0.0",
        "eslint-plugin-import": "^2.29.0",
        "eslint-plugin-jsx-a11y": "^6.8.0"
      };
    case "custom":
      return {
        ...baseDeps,
        "eslint-plugin-import": "^2.29.0",
        "eslint-config-react-app": "^7.0.1"
      };
    case "eslint":
    default:
      return baseDeps;
  }
}

/**
 * Get prettier dependencies if prettier is enabled
 * @param prettierEnabled - Whether prettier is enabled
 * @returns Object with prettier-related package names and versions
 */
export function getPrettierDependencies(prettierEnabled: boolean): { [key: string]: string } {
  if (!prettierEnabled) return {};
  
  return {
    "prettier": "^3.2.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.0"
  };
}

/**
 * Get Prettier configuration
 * @returns Prettier configuration as JSON string
 */
export function getPrettierConfig(): string {
  return JSON.stringify({
    semi: true,
    trailingComma: "all",
    singleQuote: true,
    printWidth: 100,
    tabWidth: 2,
    arrowParens: "always",
    endOfLine: "auto"
  }, null, 2);
}

/**
 * Get Husky dependencies
 * @param huskyEnabled - Whether husky is enabled
 * @returns Object with husky-related package names and versions
 */
export function getHuskyDependencies(huskyEnabled: boolean): { [key: string]: string } {
  if (!huskyEnabled) return {};
  
  return {
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0"
  };
}

/**
 * Get Husky pre-commit hook configuration
 * @param hasLinter - Whether linter is enabled
 * @param hasPrettier - Whether prettier is enabled
 * @returns pre-commit hook script content
 */
export function getHuskyPreCommitHook(hasLinter: boolean, hasPrettier: boolean): string {
  const commands: string[] = [];
  
  if (hasLinter) {
    commands.push('npm run lint:fix');
  }
  
  if (hasPrettier) {
    commands.push('npm run format');
  }
  
  // Fallback if no linter or prettier
  if (commands.length === 0) {
    commands.push('echo "Running pre-commit checks..."');
  }
  
  return `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

${commands.join('\n')}
npx lint-staged
`;
}

/**
 * Get lint-staged configuration
 * @param hasLinter - Whether linter is enabled
 * @param hasPrettier - Whether prettier is enabled
 * @returns lint-staged configuration as JSON string
 */
export function getLintStagedConfig(hasLinter: boolean, hasPrettier: boolean): string {
  const config: { [key: string]: string[] } = {};
  
  const jstsPatterns = "*.{js,jsx,ts,tsx}";
  const allPatterns = "*.{js,jsx,ts,tsx,json,css,scss,md}";
  
  if (hasLinter && hasPrettier) {
    config[jstsPatterns] = [
      "eslint --fix",
      "prettier --write"
    ];
    config["*.{json,css,scss,md}"] = ["prettier --write"];
  } else if (hasLinter) {
    config[jstsPatterns] = ["eslint --fix"];
  } else if (hasPrettier) {
    config[allPatterns] = ["prettier --write"];
  } else {
    config[jstsPatterns] = ["echo 'Staged files checked'"];
  }
  
  return JSON.stringify(config, null, 2);
}
