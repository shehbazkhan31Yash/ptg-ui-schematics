export const ESLINT_CONFIGS = {
  airbnb: {
    root: true,
    ignorePatterns: ["projects/**/*"],
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
          "@typescript-eslint/no-unused-vars": "warn",
          "@typescript-eslint/no-explicit-any": "warn",
          "linebreak-style": "off",
          "import/prefer-default-export": "off",
          "class-methods-use-this": "off",
          "@typescript-eslint/no-empty-function": "off",
          "no-console": ["warn", { "allow": ["warn", "error"] }]
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
    ignorePatterns: ["projects/**/*"],
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
          "@typescript-eslint/no-unused-vars": "warn",
          "@typescript-eslint/no-explicit-any": "warn",
          "linebreak-style": "off",
          "import/prefer-default-export": "off",
          "class-methods-use-this": "off",
          "@typescript-eslint/no-empty-function": "off",
          "no-console": ["warn", { "allow": ["warn", "error"] }]
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
    ignorePatterns: ["projects/**/*"],
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
          "max-lines": ["error", { max: 400, skipBlankLines: true, skipComments: true }],
          "quotes": ["error", "single"],
          "semi": ["error", "always"],
          "no-unused-vars": "warn",
          "@typescript-eslint/no-unused-vars": [
            "error",
            { argsIgnorePattern: "^_" }
          ],
          "eqeqeq": ["error", "always"],
          "curly": ["error", "all"],
          "prefer-const": "error",
          "no-var": "error",
          "no-console": ["warn", { allow: ["warn", "error"] }],
          "no-debugger": "warn",
          "@typescript-eslint/no-explicit-any": "error",
          "@typescript-eslint/no-non-null-assertion": "warn",
          "@typescript-eslint/no-inferrable-types": "off",
          "@typescript-eslint/explicit-function-return-type": [
            "off",
            {
              allowExpressions: true,
              allowTypedFunctionExpressions: true
            }
          ],
          "@typescript-eslint/naming-convention": [
            "error",
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
              format: ["camelCase", "UPPER_CASE"]
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
          "@angular-eslint/no-empty-lifecycle-method": "error",
          "@angular-eslint/use-lifecycle-interface": "error",
          "@angular-eslint/no-output-on-prefix": "error",
          "@angular-eslint/no-conflicting-lifecycle": "error",
          "@angular-eslint/prefer-on-push-component-change-detection": "off",
          "@angular-eslint/no-host-metadata-property": "off",
          "@angular-eslint/no-inputs-metadata-property": "error",
          "@angular-eslint/no-outputs-metadata-property": "error",
          "@angular-eslint/use-pipe-transform-interface": "error",
          "rxjs/no-ignored-observable": "warn",
          "rxjs/no-nested-subscribe": "error",
          "rxjs/no-unbound-methods": "error",
          "rxjs/no-unsafe-takeuntil": "error",
          "rxjs/no-implicit-any-catch": "error",
          "rxjs/no-subject-value": "error",
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
          "complexity": ["warn", 10],
          "max-depth": ["warn", 3],
          "max-lines-per-function": ["warn", 150],
          "max-params": ["warn", 7],
          "max-nested-callbacks": ["warn", 3],
          "no-duplicate-imports": "error",
          "@typescript-eslint/no-unnecessary-type-assertion": "error",
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
        files: ["*.spec.ts", "translation-keys.ts"],
        rules: {
          "max-lines": "off"
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