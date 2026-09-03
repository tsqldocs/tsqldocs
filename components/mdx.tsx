import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { SqlRunner } from './sql-runner';
import CodeBlock from './code-block';
import { Parameters, Param, Related, TryPlayground } from './doc-widgets';
import { QueryDoctor } from './query-doctor';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    pre: CodeBlock,
    SqlRunner,
    QueryDoctor,
    Parameters,
    Param,
    Related,
    TryPlayground,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
