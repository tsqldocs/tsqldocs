import { createMDX } from 'fumadocs-mdx/next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const withMDX = createMDX({
  macro: {
    include: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
  },
});

/** @type {import('next').NextConfig} */
const config = {
  serverExternalPackages: ['@takumi-rs/core'],
  reactStrictMode: true,
};

initOpenNextCloudflareForDev();

export default withMDX(config);
