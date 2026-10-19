import { redirect } from 'next/navigation';

type DashboardPageProps = {
  params: Promise<{ partner: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { partner } = await params;

  redirect(`/${partner}/dashboard/overview`);
}
