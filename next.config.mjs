import { createMDX } from 'fumadocs-mdx/next';

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

export default withMDX(config);
