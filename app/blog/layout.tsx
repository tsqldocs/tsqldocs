import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { AISearch, AISearchPanel } from '@/components/ai/search';

export default function Layout({ children }: LayoutProps<'/blog'>) {
  return (
    <HomeLayout {...baseOptions()}>
      <AISearch>
        <AISearchPanel />
        {children}
      </AISearch>
    </HomeLayout>
  );
}
