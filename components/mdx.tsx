import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { SqlRunner } from './sql-runner';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    SqlRunner,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
