import { redirect } from 'next/navigation';

type SettingsPageProps = {
  params: Promise<{ partner: string }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { partner } = await params;
  redirect(`/${partner}/dashboard/settings/configure-metrics`);
}
