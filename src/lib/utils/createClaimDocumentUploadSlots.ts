import { CREATE_CLAIM_UPLOAD_SLOTS } from '@/lib/constants/createClaim.constants';
import type { DeathClaimRequiredDocument } from '@/lib/types/claims-management/deathClaimApi';
import { DOCUMENT_UPLOAD_ACCEPT } from '@/lib/utils/documentUpload';

const DOCUMENT_UPLOAD_ACCEPT_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);

export type ClaimDocumentUploadSlot = {
  id: string;
  title: string;
  subtitle: string;
  accept: string;
  isRequired: boolean;
};

export function buildAcceptAttributeFromExtensions(extensions: string[]): string {
  const dotted = extensions
    .map((e) => {
      const t = e.trim().toLowerCase();
      if (!t) return '';
      const withDot = t.startsWith('.') ? t : `.${t}`;
      return withDot === '.jpe' ? '.jpeg' : withDot;
    })
    .filter((ext) => DOCUMENT_UPLOAD_ACCEPT_EXTENSIONS.has(ext));

  if (!dotted.length) {
    return DOCUMENT_UPLOAD_ACCEPT;
  }

  const mimes = new Set<string>();
  for (const ext of dotted) {
    if (ext === '.jpg' || ext === '.jpeg') mimes.add('image/jpeg');
    if (ext === '.png') mimes.add('image/png');
    if (ext === '.pdf') mimes.add('application/pdf');
  }
  return [...new Set([...dotted, ...mimes])].join(',');
}

export function mapDeathClaimRequiredDocumentsToUploadSlots(
  docs: DeathClaimRequiredDocument[],
): ClaimDocumentUploadSlot[] {
  return docs.map((doc) => ({
    id: doc.type,
    title: doc.name,
    subtitle: 'Click to upload',
    accept: buildAcceptAttributeFromExtensions(doc.extension),
    isRequired: doc.required,
  }));
}

export function mapLegacyCreateClaimUploadSlotsToUploadSlots(): ClaimDocumentUploadSlot[] {
  return CREATE_CLAIM_UPLOAD_SLOTS.map((slot) => ({
    id: slot.id,
    title: slot.title,
    subtitle: slot.subtitle,
    accept: DOCUMENT_UPLOAD_ACCEPT,
    isRequired: true,
  }));
}
