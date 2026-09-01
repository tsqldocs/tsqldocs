import { defineConfig } from "vite";
import vinext from "vinext";
import tailwindcss from "@tailwindcss/vite";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";
import { cdnAdapter } from "@vinext/cloudflare/cache/cdn-adapter";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

export default defineConfig({
  plugins: [
    // Tailwind v4 for the Vite build. Required (not just @tailwindcss/postcss) so
    // that `@source inline(...)` safelists imported transitively from
    // fumadocs-ui/css/preset.css are resolved and the docs-layout utilities
    // ([grid-area:sidebar], w-(--fd-sidebar-width), etc.) actually get generated.
    tailwindcss(),
    // Compiles `fumadocs-mdx/macro` (used in lib/source.ts). vinext builds with
    // vite/rolldown and does not run next.config.mjs, so the macro transform has
    // to be registered here or every /docs route crashes at runtime.
    fumadocsMdx({
      macro: {
        include: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.mjs", "**/*.cjs"],
      },
    }),
    vinext({
      cache: { data: kvDataAdapter(), cdn: cdnAdapter() },
      images: { optimizer: imagesOptimizer() },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
