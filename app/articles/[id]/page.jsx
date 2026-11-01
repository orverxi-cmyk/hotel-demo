import { redirect } from 'next/navigation';

export default async function DynamicArticlesPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id || '';
  redirect(id ? `/discover?article=${id}` : '/discover');
}

