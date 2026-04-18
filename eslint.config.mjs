import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [".next/**", "node_modules/**"],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    files: ["app/admin/sponsors/page.tsx", "components/sections/sponsors.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: ["supabase/functions/**/*.ts"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
];

export default config;
