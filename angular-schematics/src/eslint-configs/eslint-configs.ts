export const ESLINT_CONFIGS = {
  airbnb: {
    root: true,
    ignorePatterns: ["projects/**/*", "dist/**/*", "node_modules/**/*", "*.js", "*.d.ts"],
    overrides: [
      {
        files: ["*.ts"],
        extends: [
          "plugin:@typescript-eslint/recommended",
          "airbnb-base",
          "airbnb-typescript/base"
        ],
        parser: "@typescript-eslint/parser",
        parserOptions: {
          project: ["tsconfig.json"],
          createDefaultProgram: true
        },
        plugins: ["@typescript-eslint"],
        rules: {
          "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
          "@typescript-eslint/no-explicit-any": "warn",
          "@typescript-eslint/explicit-function-return-type": "off",
          "@typescript-eslint/no-inferrable-types": "off",
          "@typescript-eslint/no-empty-function": "off",
          "@typescript-eslint/ban-ts-comment": "off",
          "linebreak-style": "off",
          "import/prefer-default-export": "off",
          "import/no-unresolved": "off",
          "class-methods-use-this": "off",
          "no-console": ["warn", { "allow": ["warn", "error"] }],
          "no-unused-vars": "off",
          "max-len": ["warn", { "code": 120, "ignoreUrls": true, "ignoreStrings": true }],
          "@typescript-eslint/comma-dangle": "off",
          "@typescript-eslint/quotes": "off"
        }
      },
      {
        files: ["*.html"],
        extends: ["plugin:@angular-eslint/template/recommended"],
        rules: {
          "@angular-eslint/template/no-negated-async": "error"
        }
      }
    ]
  },
  
  standard: {
    root: true,
    ignorePatterns: ["projects/**/*", "dist/**/*", "node_modules/**/*", "*.js", "*.d.ts"],
    overrides: [
      {
        files: ["*.ts"],
        extends: [
          "plugin:@typescript-eslint/recommended",
          "standard"
        ],
        parser: "@typescript-eslint/parser",
        parserOptions: {
          project: ["tsconfig.json"],
          createDefaultProgram: true
        },
        plugins: ["@typescript-eslint"],
        rules: {
          "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
          "@typescript-eslint/no-explicit-any": "warn",
          "@typescript-eslint/explicit-function-return-type": "off",
          "@typescript-eslint/no-inferrable-types": "off",
          "@typescript-eslint/no-empty-function": "off",
          "@typescript-eslint/ban-ts-comment": "off",
          "linebreak-style": "off",
          "import/prefer-default-export": "off",
          "import/no-unresolved": "off",
          "class-methods-use-this": "off",
          "no-console": ["warn", { "allow": ["warn", "error"] }],
          "no-unused-vars": "off",
          "max-len": ["warn", { "code": 120, "ignoreUrls": true, "ignoreStrings": true }]
        }
      },
      {
        files: ["*.html"],
        extends: ["plugin:@angular-eslint/template/recommended"],
        rules: {
          "@angular-eslint/template/no-negated-async": "error"
        }
      }
    ]
  },
  
  custom: {
    root: true,
    ignorePatterns: ["projects/**/*", "dist/**/*", "node_modules/**/*", "*.js", "*.d.ts"],
    overrides: [
      {
        files: ["*.ts"],
        extends: [
          "eslint:recommended",
          "plugin:@typescript-eslint/recommended",
          "plugin:@angular-eslint/recommended",
          "plugin:@angular-eslint/template/process-inline-templates",
          "plugin:rxjs/recommended",
          "plugin:prettier/recommended",
          "prettier"
        ],
        parserOptions: {
          project: ["tsconfig.json", "tsconfig.app.json", "tsconfig.spec.json"],
          createDefaultProgram: true
        },
        rules: {
          "@angular-eslint/directive-selector": [
            "error",
            {
              type: "attribute",
              prefix: "app",
              style: "camelCase"
            }
          ],
          "@angular-eslint/component-selector": [
            "error",
            {
              type: "element",
              prefix: "app",
              style: "kebab-case"
            }
          ],
          "max-lines": ["warn", { max: 500, skipBlankLines: true, skipComments: true }],
          "quotes": ["error", "single"],
          "semi": ["error", "always"],
          "no-unused-vars": "off",
          "@typescript-eslint/no-unused-vars": [
            "warn",
            { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
          ],
          "eqeqeq": ["error", "always"],
          "curly": ["error", "all"],
          "prefer-const": "error",
          "no-var": "error",
          "no-console": ["warn", { allow: ["warn", "error"] }],
          "no-debugger": "warn",
          "@typescript-eslint/no-explicit-any": "warn",
          "@typescript-eslint/no-non-null-assertion": "warn",
          "@typescript-eslint/no-inferrable-types": "off",
          "@typescript-eslint/explicit-function-return-type": "off",
          "@typescript-eslint/naming-convention": [
            "warn",
            {
              selector: "interface",
              format: ["PascalCase"]
            },
            {
              selector: "enum",
              format: ["PascalCase"]
            },
            {
              selector: "variable",
              format: ["camelCase", "UPPER_CASE", "PascalCase"]
            },
            {
              selector: "function",
              format: ["camelCase"]
            },
            {
              selector: "class",
              format: ["PascalCase"]
            }
          ],
          "@typescript-eslint/member-ordering": "warn",
          "@typescript-eslint/consistent-type-assertions": "error",
          "@angular-eslint/no-empty-lifecycle-method": "warn",
          "@angular-eslint/use-lifecycle-interface": "error",
          "@angular-eslint/no-output-on-prefix": "error",
          "@angular-eslint/no-conflicting-lifecycle": "error",
          "@angular-eslint/prefer-on-push-component-change-detection": "off",
          "@angular-eslint/no-host-metadata-property": "off",
          "@angular-eslint/no-inputs-metadata-property": "warn",
          "@angular-eslint/no-outputs-metadata-property": "warn",
          "@angular-eslint/use-pipe-transform-interface": "error",
          "rxjs/no-ignored-observable": "warn",
          "rxjs/no-nested-subscribe": "warn",
          "rxjs/no-unbound-methods": "warn",
          "rxjs/no-unsafe-takeuntil": "warn",
          "rxjs/no-implicit-any-catch": "warn",
          "rxjs/no-subject-value": "warn",
          "rxjs/finnish": [
            "error",
            {
              functions: false,
              methods: false,
              parameters: true,
              properties: true,
              variables: true
            }
          ],
          "complexity": ["warn", 15],
          "max-depth": ["warn", 4],
          "max-lines-per-function": ["warn", 200],
          "max-params": ["warn", 10],
          "max-nested-callbacks": ["warn", 4],
          "no-duplicate-imports": "error",
          "@typescript-eslint/no-unnecessary-type-assertion": "warn",
          "@typescript-eslint/no-empty-function": "off",
          "@typescript-eslint/no-unused-expressions": "off",
          "@typescript-eslint/ban-ts-comment": "off",
          // "@typescript-eslint/comma-dangle": ["error", "always-multiline"],
          "@typescript-eslint/indent": ["error", 2],
          "import/no-unresolved": "off",
          "import/prefer-default-export": "off",
          "import/order": ["error", { "newlines-between": "always" }],
          "import/newline-after-import": "error",
          "import/no-duplicates": "error",
          "class-methods-use-this": "off",
          "no-trailing-spaces": "error",
          "eol-last": ["error", "always"],
          "arrow-parens": ["error", "always"],
          "object-curly-newline": ["error", { "ImportDeclaration": { "multiline": true, "minProperties": 3 } }],
          "prettier/prettier": [
            "error",
            {
              endOfLine: "auto",
              singleQuote: true
            }
          ]
        }
      },
      {
        files: ["*.spec.ts", "translation-keys.ts", "*.component.ts", "*.service.ts", "*.module.ts"],
        rules: {
          "max-lines": "off",
          "@typescript-eslint/no-explicit-any": "off",
          "max-lines-per-function": "off",
          "complexity": "off",
          "@angular-eslint/no-empty-lifecycle-method": "off",
          "@typescript-eslint/no-empty-function": "off"
        }
      },
      {
        files: ["*.html"],
        extends: [
          "plugin:@angular-eslint/template/recommended"
        ],
        parser: "@angular-eslint/template-parser",
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: "module"
        },
        rules: {
          "@angular-eslint/template/no-negated-async": "error",
          "@angular-eslint/template/conditional-complexity": [
            "error",
            { maxComplexity: 4 }
          ],
          "@angular-eslint/template/mouse-events-have-key-events": "warn",
          "@angular-eslint/template/click-events-have-key-events": "warn",
          "@angular-eslint/template/no-any": "warn",
          "@angular-eslint/template/no-duplicate-attributes": "error"
        }
      }
    ]
  }
};

export const ESLINT_DEPENDENCIES = {
  airbnb: [
    "eslint-config-airbnb-base@15.0.0",
    "eslint-config-airbnb-typescript@18.0.0", 
    "eslint-plugin-import@2.30.0",
    "@angular-eslint/eslint-plugin@18.0.0",
    "@angular-eslint/eslint-plugin-template@18.0.0",
    "@angular-eslint/template-parser@18.0.0"
  ],
  standard: [
    "eslint-config-standard@17.1.0",
    "eslint-plugin-import@2.30.0",
    "eslint-plugin-n@16.6.2",
    "eslint-plugin-promise@6.6.0",
    "@angular-eslint/eslint-plugin@18.0.0",
    "@angular-eslint/eslint-plugin-template@18.0.0",
    "@angular-eslint/template-parser@18.0.0"
  ],
  custom: [
    "@angular-eslint/eslint-plugin@18.0.0",
    "@angular-eslint/eslint-plugin-template@18.0.0",
    "@angular-eslint/template-parser@18.0.0",
    "eslint-plugin-rxjs@5.0.0",
    "eslint-plugin-prettier@5.0.0",
    "eslint-config-prettier@9.0.0",
    "prettier@3.0.0"
  ]
};