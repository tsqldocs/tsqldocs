import { AISearch, AISearchPanel } from '@/components/ai/search';

export default function Layout({ children }: LayoutProps<'/tools'>) {
  return (
    <AISearch>
      <AISearchPanel />
      {children}
    </AISearch>
  );
}
