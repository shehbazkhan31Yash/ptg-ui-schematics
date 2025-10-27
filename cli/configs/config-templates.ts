/**
 * Template utility functions for React app generation
 */

/**
 * Get Prettier configuration
 */
export function getPrettierConfig(): string {
  return JSON.stringify({
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2,
    "useTabs": false
  }, null, 2);
}

/**
 * Configuration constants for Nx and TypeScript
 */
export const CONFIG = {
  NX_CONFIG: {
    $schema: "./node_modules/nx/schemas/nx-schema.json",
    namedInputs: {
      default: ["{projectRoot}/**/*", "sharedGlobals"],
      production: [
        "default",
        "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)",
        "!{projectRoot}/tsconfig.spec.json",
        "!{projectRoot}/jest.config.[jt]s",
        "!{projectRoot}/eslint.config.js",
        "!{projectRoot}/src/test-setup.[jt]s",
        "!{projectRoot}/test-setup.[jt]s",
      ],
      sharedGlobals: [],
    },
    targetDefaults: {
      build: {
        dependsOn: ["^build"],
        inputs: ["production", "^production"],
      },
      test: {
        inputs: [
          "default",
          "^production",
          "{workspaceRoot}/jest.preset.js",
        ],
      },
      lint: {
        inputs: ["default", "{workspaceRoot}/eslint.config.js"],
      },
    },
    generators: {
      "@nx/react": {
        application: {
          style: "css",
          linter: "eslint",
          bundler: "vite",
        },
        component: {
          style: "css",
        },
        library: {
          style: "css",
          linter: "eslint",
        },
      },
    },
  },
  
  TSCONFIG_BASE: {
    compileOnSave: false,
    compilerOptions: {
      rootDir: ".",
      sourceMap: true,
      declaration: false,
      moduleResolution: "node",
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      importHelpers: true,
      target: "es2015",
      module: "esnext",
      lib: ["es2020", "dom"],
      skipLibCheck: true,
      skipDefaultLibCheck: true,
      baseUrl: ".",
      paths: {},
    },
    exclude: ["node_modules", "tmp"],
  },
  
  TSCONFIG: {
    extends: "./tsconfig.base.json",
    compilerOptions: {
      composite: true,
      declaration: true,
      declarationMap: true,
    },
    files: [],
    include: [],
    references: [],
  },
  
  APP_TSCONFIG: {
    extends: "../../tsconfig.base.json",
    compilerOptions: {
      jsx: "react-jsx",
      allowJs: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: false,
      moduleResolution: "node",
      types: ["node", "vite/client"],
    },
    include: ["src/**/*", "index.html"],
    exclude: ["node_modules", "dist"],
  }
};