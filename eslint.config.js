import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// ─── Shared base config ───────────────────────────────────────────────────────
const base = {
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  plugins: {
    "react-hooks": reactHooks,
    "react-refresh": reactRefresh,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],

    // ── Security: never use dangerous HTML injection ──────────────────────
    "no-restricted-globals": [
      "error",
      { name: "event", message: "Use local event parameter instead." },
    ],
  },
};

// ─── Module boundary rules ────────────────────────────────────────────────────
//
// Architecture contract:
//   features/X  →  may import from:
//     • own feature   (features/X/**)
//     • shared        (@/shared/**)
//     • components    (@/components/**)
//     • lib           (@/lib/**)
//     • hooks         (@/hooks/**)
//     • services/api  (@/services/api/**)
//     • auth hooks    (@/features/auth/hooks/**)   ← cross-feature exception
//     • auth types    (@/features/auth/types/**)   ← cross-feature exception
//
//   features/X  →  MUST NOT import from:
//     • other features' pages, services, store, or components

// Helper that builds the forbidden cross-feature patterns for a given feature
function crossFeaturePatterns(ownFeature) {
  const all = ["auth", "dashboard", "menus", "returned-cheques", "roles", "settings", "users", "audit", "feature-flags"];
  return all
    .filter((f) => f !== ownFeature)
    .flatMap((f) => [
      {
        group: [`@/features/${f}/pages`, `@/features/${f}/pages/**`],
        message: `Import from a feature's pages/ is forbidden. Use its exported hooks or services.`,
      },
      {
        group: [`@/features/${f}/services`, `@/features/${f}/services/**`],
        message: `Import from another feature's services/ is forbidden. Call the API via your own service layer.`,
      },
      {
        group: [`@/features/${f}/store`, `@/features/${f}/store/**`],
        message: `Import from another feature's store/ is forbidden. Use its published hooks.`,
      },
      {
        group: [`@/features/${f}/components`, `@/features/${f}/components/**`],
        message: `Import another feature's components/ is forbidden. Move shared components to @/shared/components/.`,
      },
    ]);
}

const features = ["auth", "dashboard", "menus", "returned-cheques", "roles", "settings", "users", "audit", "feature-flags"];

const featureBoundaryConfigs = features.map((feature) => ({
  files: [`src/features/${feature}/**/*.{ts,tsx}`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: crossFeaturePatterns(feature),
      },
    ],
  },
}));

// ─── Shared layer must not import from features ───────────────────────────────
const sharedBoundaryConfig = {
  files: ["src/shared/**/*.{ts,tsx}", "src/lib/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@/features/**"],
            message: "Shared code must not depend on features. Move logic to @/shared/ or @/lib/.",
          },
        ],
      },
    ],
  },
};

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },
  base,
  ...featureBoundaryConfigs,
  sharedBoundaryConfig,
);
