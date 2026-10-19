import { useEffect, useMemo, useState } from 'react';
import ErrorCard from '@/components/molecules/ErrorCard';
import { mapPolicyDetailsToPanel } from '@/lib/adapter/policy-details/policyDetails.adapter';
import { useCachedPolicyDetailsQuery } from '@/lib/query/policyDetails.queries';
import { useDownloadPolicyHealthCardPdfQuery } from '@/lib/query/policyHealthCard.queries';
import InformationCard from '@/components/organisms/InformationCard';
import InsuredSelect from '@/components/molecules/InsuredSelect';
import { useInsuredSelect } from '@/lib/hooks/useInsuredSelect';
import FamilyMembersSection from '@/components/organisms/FamilyMembersSection';
import FamilyMembersSectionSkelton from '@/components/molecules/skeltons/FamilyMembersSectionSkelton';
import PolicyInformationSkelton from '@/components/molecules/skeltons/PolicyInformationSkelton';
import CustomerInformationSkelton from '@/components/molecules/skeltons/CustomerInformationSkelton';
import { usePolicyHealthCardStore } from '@/lib/store/policyHealthCard.store';
import { toast } from 'sonner';
import { calculateAge } from '@/lib/utils/helpers';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import { trackPolicyDetailsTabDownloadHealthCard } from '@/lib/segment/track/policy';

const formatStatusLabel = (status?: string) => {
  if (!status) {
    return undefined;
  }

  const normalized = status.toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

type PolicyDetailsTabProps = {
  policyNumber: string;
  setPolicyHeaderTitle: (title: string) => void;
  setPolicyStatus: (status: string | null) => void;
  setPolicyCertificateUrl: (url: string) => void;
};

export default function PolicyDetailsTab({
  policyNumber,
  setPolicyHeaderTitle,
  setPolicyStatus,
  setPolicyCertificateUrl,
}: PolicyDetailsTabProps) {
  const segmentBase = useSegmentPartnerBase();
  const { setPolicyId } = usePolicyHealthCardStore();
  const { downloadPolicyHealthCardPdf } = useDownloadPolicyHealthCardPdfQuery();
  const [loadingHealthCardUhid, setLoadingHealthCardUhid] = useState('');
  const {
    data: policyDetailsResponse,
    isLoading,
    isError,
    error,
  } = useCachedPolicyDetailsQuery({
    policyNumber,
  });
  const fetchedPolicy = policyDetailsResponse?.data?.policies?.[0];
  const resolvedPanel = fetchedPolicy ? mapPolicyDetailsToPanel(fetchedPolicy) : undefined;
  const { insuredOptions, selectedInsured, setSelectedInsured, isDisabled, placeholder } =
    useInsuredSelect({
      policyDetailsResponse,
      isLoading,
    });
  const policyStatusLabel = formatStatusLabel(fetchedPolicy?.status);
  const selectedPerson = useMemo(() => {
    const persons = fetchedPolicy?.persons ?? [];
    if (!persons.length) {
      return undefined;
    }

    return persons.find((person) => person.insured?.id === selectedInsured) ?? persons[0];
  }, [fetchedPolicy?.persons, selectedInsured]);

  const sections = useMemo(() => {
    if (!resolvedPanel?.sections?.length) {
      return [];
    }

    return resolvedPanel.sections.map((section) => ({
      id: section.id,
      title: section.title,
      columns: section.columns.map((column, columnIndex) => ({
        id: column[0]?.id ?? `${section.id}-column-${columnIndex}`,
        items: column.map((item) => ({
          label: item.label,
          value: item.value,
          action: item.copyValue
            ? {
                label: `Copy ${item.label}`,
                onClick: () => navigator.clipboard.writeText(item.copyValue ?? item.value),
              }
            : undefined,
        })),
      })),
    }));
  }, [resolvedPanel]);

  const handleFamilyMemberHealthCardDownload = async (uhid: string) => {
    if (!fetchedPolicy?.policyId || !uhid || loadingHealthCardUhid === uhid) {
      return;
    }

    setLoadingHealthCardUhid(uhid);
    trackPolicyDetailsTabDownloadHealthCard(segmentBase, {
      policy_number: policyNumber,
      entity_name: uhid,
    });
    try {
      const response = await downloadPolicyHealthCardPdf(uhid);
      const pdfUrl = response.data.url;

      if (!pdfUrl) {
        toast.error('Health card download link is unavailable');
        return;
      }

      window.open(pdfUrl, '_blank');
    } catch {
      toast.error('Failed to download health card');
    } finally {
      setLoadingHealthCardUhid('');
    }
  };

  const familyMembers = useMemo(() => {
    if (!selectedPerson?.insured) {
      return [];
    }

    const insuredEntry = {
      id: selectedPerson.insured.id ?? selectedPerson.insured.uhid ?? 'insured',
      name: selectedPerson.insured.name ?? '-',
      relation: 'Primary insured',
      statusLabel: policyStatusLabel,
      isNominee: false,
      uhid: selectedPerson.insured.uhid,
      gender: selectedPerson.insured.gender?.toLowerCase() ?? '-',
      age: calculateAge(selectedPerson?.insured?.dob ?? '') ?? '-',
    };

    const dependents = (selectedPerson.dependents ?? []).map((dependent, index) => ({
      id: dependent.id ?? dependent.uhid ?? `dependent-${index + 1}`,
      name: dependent.name ?? '-',
      relation: dependent.relationship ?? 'Dependent',
      dateOfBirth: dependent.dob ?? '-',
      memberId: dependent.uhid ?? '-',
      statusLabel: policyStatusLabel,
      isNominee: false,
      uhid: dependent.uhid,
      gender: dependent.gender?.toLowerCase() ?? '-',
      age: calculateAge(dependent?.dob ?? '') ?? '-',
    }));

    return [insuredEntry, ...dependents];
  }, [policyStatusLabel, selectedPerson]);

  const insuredSelect = (
    <InsuredSelect
      value={selectedInsured}
      options={insuredOptions}
      onValueChange={setSelectedInsured}
      disabled={isDisabled}
      placeholder={placeholder}
      showWhenEmpty
    />
  );

  useEffect(() => {
    if (fetchedPolicy) {
      setPolicyHeaderTitle(policyNumber + ' - ' + fetchedPolicy?.planDetails?.planId);
      setPolicyStatus(fetchedPolicy?.status);
      setPolicyCertificateUrl(fetchedPolicy?.certificatePdf ?? '');
    }
  }, [fetchedPolicy, policyNumber, setPolicyHeaderTitle, setPolicyStatus, setPolicyCertificateUrl]);

  useEffect(() => {
    if (fetchedPolicy?.policyId) {
      setPolicyId(fetchedPolicy.policyId);
    }
  }, [fetchedPolicy?.policyId, setPolicyId]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {insuredSelect}
        <div className="grid gap-4 lg:grid-cols-3">
          <PolicyInformationSkelton className="lg:col-span-2" />
          <CustomerInformationSkelton className="lg:col-span-1" />
        </div>
        <FamilyMembersSectionSkelton cardCount={4} />
      </div>
    );
  }

  if (isError) {
    return (
      <>
        {insuredSelect}
        <ErrorCard
          title="Unable to load policy details"
          description={error?.response?.data?.message ?? 'Please try again.'}
          className="mt-4"
        />
      </>
    );
  }

  if (!sections.length) {
    return (
      <>
        {insuredSelect}
        <ErrorCard
          title="Policy details unavailable"
          description="We couldn't load policy details. Please try again later."
          className="mt-4"
        />
      </>
    );
  }

  const [primarySection, ...secondarySections] = sections;

  return (
    <div className="h-[67vh] overflow-y-auto p-1">
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {primarySection && (
              <InformationCard title={primarySection.title} columns={primarySection.columns} />
            )}
          </div>
          <div className="lg:col-span-1">
            {secondarySections.map((section) => (
              <InformationCard key={section.id} title={section.title} columns={section.columns} />
            ))}
          </div>
        </div>
        {familyMembers.length && (
          <FamilyMembersSection
            title="Insured members"
            members={familyMembers}
            insuredSelectSlot={insuredSelect}
            onHealthCardClick={handleFamilyMemberHealthCardDownload}
            loadingHealthCardUhid={loadingHealthCardUhid}
          />
        )}
      </div>
    </div>
  );
}
