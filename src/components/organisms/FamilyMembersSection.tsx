import type { ReactNode } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type FamilyMember = {
  id: string;
  name: string;
  relation?: string;
  age: string | number;
  memberId?: string;
  statusLabel?: string;
  isNominee?: boolean;
  uhid?: string;
  gender?: string;
};

type FamilyMembersSectionProps = {
  title: string;
  members: FamilyMember[];
  insuredSelectSlot?: ReactNode;
  onHealthCardClick?: (uhid: string) => void;
  loadingHealthCardUhid?: string;
};

export default function FamilyMembersSection({
  title,
  members,
  insuredSelectSlot,
  onHealthCardClick,
  loadingHealthCardUhid = 'false',
}: FamilyMembersSectionProps) {
  return (
    <Card className={'gap-4 px-6 py-6'}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        {insuredSelectSlot}
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="flex items-center border-b border-border bg-recent-searches-header-bg">
          <div className="min-w-table-column-width px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {'Member'}
            </span>
          </div>
          <div className="w-full px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {'Relation with insured'}
            </span>
          </div>
          <div className="w-full px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {'Gender'}
            </span>
          </div>
          <div className="w-full px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {'Age (in years)'}
            </span>
          </div>
          <div className="min-w-table-column-width flex items-center px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {'Health card'}
            </span>
          </div>
        </div>

        {members.map((member) => (
          <div key={member.id} className="flex items-center border-b border-border last:border-b-0">
            <div className="min-w-table-column-width px-4 py-2">
              <span className="truncate text-sm text-foreground capitalize">{member.name}</span>
            </div>
            <div className="w-full px-4 py-2">
              <span className="truncate text-sm text-foreground capitalize">
                {member.relation ?? '-'}
              </span>
            </div>
            <div className="w-full px-4 py-2">
              <span className="truncate text-sm text-foreground capitalize">
                {member.gender ?? '-'}
              </span>
            </div>
            <div className="w-full px-4 py-2">
              <span className="truncate text-sm text-foreground">{member.age ?? '-'}</span>
            </div>
            <div className="min-w-table-column-width flex items-center px-4 py-2">
              {member.uhid ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  title="View health card"
                  onClick={() => onHealthCardClick?.(member.uhid || '')}
                  disabled={loadingHealthCardUhid === member.uhid}
                >
                  {loadingHealthCardUhid === member.uhid ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
