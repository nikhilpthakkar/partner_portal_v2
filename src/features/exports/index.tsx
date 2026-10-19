import { PageHeading, PAGE_LAYOUT_CLASS } from '@/components/molecules/PageHeading';

export default function Exports() {
  return (
    <div className={PAGE_LAYOUT_CLASS}>
      <PageHeading title="Exports" subtitle="Download and manage exported data" />
    </div>
  );
}
