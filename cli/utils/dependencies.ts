/**
 * Dependency Management
 * Extracted from react.ts - Contains package dependency configuration and management
 * 
 * This file contains:
 * - getDependenciesByFeature() - Main function to get all npm packages based on selected features
 * - Package mappings for authentication, routing, state management, frameworks, etc.
 */

import { getEslintDependencies, getPrettierDependencies, getHuskyDependencies } from "../configs/eslint-configs";

/**
 * Get npm dependencies based on selected features
 * Returns separate arrays for production and development dependencies
 * 
 * @param a - Application configuration object with all selected features
 * @returns Object with production and development package arrays
 */
export const getDependenciesByFeature = (a: any): { production: string[], development: string[] } => {
  // Base packages required for all React apps
  const basePkgs = ["react@latest", "react-dom@latest"];
  
  const baseDevPkgs = [
    "@types/react@latest",
    "@types/react-dom@latest",
    // Only add Vite if it's the selected bundler
    ...(a.bundler === 'vite' || a.bundler === 'esbuild' ? ["@vitejs/plugin-react@latest", "vite@latest"] : []),
    ...(a.style === 'scss' ? ["sass@latest"] : []),
    ...(a.style === 'styl' ? ["stylus@latest"] : []),
    ...(a.seo && a.bundler === 'vite' ? ["vite-plugin-ssr@latest"] : []), // Add SSR/SSG plugin for SEO (Vite only)
  ];

  // Add linting packages
  if (a.linter === "eslint" || a.linter === "airbnb" || a.linter === "custom") {
    const eslintDeps = getEslintDependencies(a.linter);
    baseDevPkgs.push(...eslintDeps);
  }

  // Add prettier if selected
  if (a.prettier) {
    const prettierDeps = getPrettierDependencies(a.prettier);
    baseDevPkgs.push(...prettierDeps);
  }

  // Add husky if selected
  if (a.husky) {
    const huskyDeps = getHuskyDependencies(a.husky);
    baseDevPkgs.push(...huskyDeps);
  }

  // Feature-specific package mappings
  const featurePackages = {
    auth: {
      msal: ["@azure/msal-react@latest", "@azure/msal-browser@latest"],
      okta: ["@okta/okta-auth-js@latest", "@okta/okta-react@latest"]
    },
    routing: ["react-router-dom@latest"],
    routingDev: ["@types/react-router-dom@latest"],
    stateManagement: {
      redux: ["@reduxjs/toolkit@latest", "react-redux@latest"],
      reduxDev: ["@types/react-redux@latest"],
      zustand: ["zustand@latest"]
    },
    i18n: ["i18next@latest", "react-i18next@latest", "i18next-browser-languagedetector@latest"],
    seo: [],  // Using custom React hook instead of external package
    seoDev: [],
    framework: {
      material: ["@mui/material@latest", "@emotion/react@latest", "@emotion/styled@latest"],
      bootstrap: ["bootstrap@latest", "react-bootstrap@latest"],
      bootstrapDev: ["@types/bootstrap@latest"]
    }
  };

  // Add feature-specific packages based on selections
  if (a.auth === 'msal') {
    basePkgs.push(...featurePackages.auth.msal);
  } else if (a.auth === 'okta') {
    basePkgs.push(...featurePackages.auth.okta);
  }
  
  if (a.routing) {
    basePkgs.push(...featurePackages.routing);
    baseDevPkgs.push(...featurePackages.routingDev);
  }
  
  if (a.stateManagement === 'redux') {
    basePkgs.push(...featurePackages.stateManagement.redux);
    baseDevPkgs.push(...featurePackages.stateManagement.reduxDev);
  } else if (a.stateManagement === 'zustand') {
    basePkgs.push(...featurePackages.stateManagement.zustand);
  }
  
  if (a.i18n) {
    basePkgs.push(...featurePackages.i18n);
  }
  
  if (a.seo) {
    basePkgs.push(...featurePackages.seo);
    baseDevPkgs.push(...featurePackages.seoDev);
  }
  
  if (a.framework === "material") {
    basePkgs.push(...featurePackages.framework.material);
  } else if (a.framework === "bootstrap") {
    basePkgs.push(...featurePackages.framework.bootstrap);
    baseDevPkgs.push(...featurePackages.framework.bootstrapDev);
  }

  return { production: basePkgs, development: baseDevPkgs };
};
