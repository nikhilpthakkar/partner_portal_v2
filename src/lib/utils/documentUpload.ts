import { toast } from 'sonner';

export const DOCUMENT_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_UPLOAD_ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';

const UNSUPPORTED = 'Unsupported file format. Use PDF, JPG, or PNG.';
const EXT_MIME: Record<string, string[]> = {
  pdf: ['application/pdf'],
  jpg: ['image/jpeg', 'image/jpg'],
  jpeg: ['image/jpeg', 'image/jpg'],
  png: ['image/png'],
};
const MAGIC: Record<string, number[][]> = {
  pdf: [[0x25, 0x50, 0x44, 0x46]],
  jpg: [[0xff, 0xd8, 0xff]],
  jpeg: [[0xff, 0xd8, 0xff]],
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
};

function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

function hasMagic(bytes: Uint8Array, signatures: number[][]): boolean {
  return signatures.some(
    (sig) => bytes.length >= sig.length && sig.every((b, i) => bytes[i] === b),
  );
}

export async function getDocumentUploadError(file: File): Promise<string | null> {
  const ext = extOf(file.name);
  const allowedMimes = EXT_MIME[ext];
  if (!allowedMimes) return UNSUPPORTED;
  if (file.size === 0) return 'Empty file.';
  if (file.size > DOCUMENT_UPLOAD_MAX_BYTES) return 'File size exceeds 10MB.';
  // Empty MIME is common in browsers; require extension + magic instead of failing closed.
  // Non-empty MIME that does not match the extension is always rejected.
  const type = file.type.toLowerCase();
  if (type && !allowedMimes.includes(type)) return UNSUPPORTED;
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (!hasMagic(header, MAGIC[ext] ?? [])) return UNSUPPORTED;
  return null;
}

export async function isDocumentUploadAllowed(
  file: File,
  input: HTMLInputElement,
): Promise<boolean> {
  const error = await getDocumentUploadError(file);
  if (!error) return true;
  toast.error(error);
  input.value = '';
  return false;
}
