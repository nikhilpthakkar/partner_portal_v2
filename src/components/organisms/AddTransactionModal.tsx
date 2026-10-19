'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SingleDatePopoverField } from '@/components/molecules/SingleDatePopoverField';
import SimpleSelect from '@/components/molecules/SimpleSelect';
import {
  LEDGER_AMOUNT_LABEL,
  LEDGER_EDIT_FIELD_OPTIONS,
  LEDGER_TAX_CATEGORIES,
} from '@/lib/constants/financialsLedger.constants';
import { useAddLedgerTransactionMutation } from '@/lib/query/financials.queries';
import { usePartnerStore } from '@/lib/store/partner.store';
import type { LedgerTransactionCategory } from '@/lib/types/financials';
import { buildAddLedgerTransactionPayload } from '@/lib/utils/addLedgerTransactionPayload';
import { toast } from 'sonner';

type AddTransactionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerBankAccount?: string;
};

const getDefaultTransactionDate = () => new Date();
const formFieldClassName =
  'h-9 w-full rounded-md border-border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground hover:bg-white focus-visible:bg-white';

const fullWidthSelectClassName =
  'h-9 w-full rounded-md border-border bg-white px-3 text-sm font-normal text-foreground shadow-xs';

const isTaxCategory = (category: LedgerTransactionCategory): category is 'TDS' | 'TCS' =>
  LEDGER_TAX_CATEGORIES.includes(category as (typeof LEDGER_TAX_CATEGORIES)[number]);

export default function AddTransactionModal({
  open,
  onOpenChange,
  partnerBankAccount,
}: AddTransactionModalProps) {
  const { productOptions, productIds } = usePartnerStore();
  const { mutateAsync: addTransaction, isPending } = useAddLedgerTransactionMutation();
  const defaultProductId = productIds[0] ?? productOptions[0]?.value ?? '';

  const [selectedProductId, setSelectedProductId] = useState(defaultProductId);
  const resolvedProductId =
    selectedProductId && productIds.includes(selectedProductId)
      ? selectedProductId
      : defaultProductId;
  const [category, setCategory] = useState<LedgerTransactionCategory>('TDS');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(getDefaultTransactionDate());
  const hydratedBankAccountRef = useRef<string | undefined>(undefined);

  const isRefundDeposit = category === 'REFUND_DEPOSIT';
  const isAddDeposit = category === 'DEPOSIT';
  const isDepositTransaction = isRefundDeposit || isAddDeposit;
  const isTaxTransaction = isTaxCategory(category);
  const prefilledBankAccountNumber = partnerBankAccount?.trim() ?? '';

  useEffect(() => {
    if (!open || !prefilledBankAccountNumber) return;
    if (hydratedBankAccountRef.current === prefilledBankAccountNumber) return;

    hydratedBankAccountRef.current = prefilledBankAccountNumber;
    queueMicrotask(() => {
      setBankAccountNumber((currentBankAccountNumber) =>
        currentBankAccountNumber ? currentBankAccountNumber : prefilledBankAccountNumber,
      );
    });
  }, [open, prefilledBankAccountNumber]);

  const resetForm = () => {
    setSelectedProductId(productIds[0] ?? productOptions[0]?.value ?? '');
    setCategory('TDS');
    setAmount('');
    setNotes('');
    setUtrNumber('');
    setBankAccountNumber(prefilledBankAccountNumber);
    hydratedBankAccountRef.current = prefilledBankAccountNumber || undefined;
    setSelectedDate(getDefaultTransactionDate());
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    const payloadResult = buildAddLedgerTransactionPayload({
      resolvedProductId,
      category,
      amount,
      notes,
      utrNumber,
      bankAccountNumber,
      selectedDate,
    });

    if (!payloadResult.ok) {
      toast.error(payloadResult.error);
      return;
    }

    const { payload } = payloadResult;

    try {
      await addTransaction(payload);
      toast.success('Ledger details updated successfully', {
        description: `${category.replace('_', ' ')} | ${payload.transactionDate}`,
      });
      handleClose();
    } catch {
      toast.error('Failed to update ledger details. Please try again.');
    }
  };

  const productsSingleSelectField = (
    <div className="flex w-full flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        Products <span className="text-destructive">*</span>
      </label>
      <SimpleSelect
        value={resolvedProductId}
        options={productOptions}
        onValueChange={setSelectedProductId}
        placeholder="Select product"
        disabled={productOptions.length === 0 || isPending}
        className={fullWidthSelectClassName}
      />
    </div>
  );

  const dateField = (
    <div className="w-full">
      <SingleDatePopoverField
        triggerId={`ledger-${category}-date`}
        label={
          <span className="text-sm font-medium text-foreground">
            Select date <span className="text-destructive">*</span>
          </span>
        }
        selected={selectedDate}
        onSelect={setSelectedDate}
        displayFormat="d MMM yyyy"
        placeholder="Select date"
        triggerClassName={formFieldClassName}
        labelClassName="text-sm font-medium text-foreground"
        popoverAlign="start"
        required
        className="w-full"
      />
    </div>
  );

  const amountField = (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor="ledger-transaction-amount" className="text-sm font-medium text-foreground">
        {LEDGER_AMOUNT_LABEL[category]} <span className="text-destructive">*</span>
      </label>
      <Input
        id="ledger-transaction-amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        inputMode="decimal"
        className={formFieldClassName}
        disabled={isPending}
      />
    </div>
  );

  const remarksField = (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor="ledger-transaction-remarks" className="text-sm font-medium text-foreground">
        Remarks
      </label>
      <Input
        id="ledger-transaction-remarks"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Enter remarks"
        className={formFieldClassName}
        disabled={isPending}
      />
    </div>
  );

  const utrField = (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor="ledger-transaction-utr" className="text-sm font-medium text-foreground">
        {isDepositTransaction ? 'UTR of the deposit' : 'UTR number'}{' '}
        <span className="text-destructive">*</span>
      </label>
      <Input
        id="ledger-transaction-utr"
        value={utrNumber}
        onChange={(e) => setUtrNumber(e.target.value)}
        placeholder={isDepositTransaction ? 'Enter UTR' : 'Enter UTR number'}
        className={formFieldClassName}
        disabled={isPending}
      />
    </div>
  );

  const bankAccountField = (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor="partner-bank-account" className="text-sm font-medium text-foreground">
        Bank account of partner <span className="text-destructive">*</span>
      </label>
      <Input
        id="partner-bank-account"
        value={bankAccountNumber}
        onChange={(e) => setBankAccountNumber(e.target.value)}
        placeholder="Enter bank account number"
        inputMode="numeric"
        className={formFieldClassName}
        disabled={isPending}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-[698px] rounded-[10px] border border-[#E5E5E5] bg-white !shadow-[0_10px_15px_-3px_rgba(0,0,0,0.10),0_4px_6px_-4px_rgba(0,0,0,0.10)]">
        <DialogHeader>
          <DialogTitle>Edit ledger details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Select fields to edit</p>
            <div className="flex flex-wrap items-center gap-4">
              {LEDGER_EDIT_FIELD_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-foreground"
                >
                  <input
                    type="radio"
                    name="editable-field"
                    value={option.value}
                    checked={category === option.value}
                    onChange={() => setCategory(option.value)}
                    className="size-4 accent-[#8B5CF6]"
                    disabled={isPending}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {isTaxTransaction ? (
            <div className="flex w-full flex-col gap-4">
              {productsSingleSelectField}

              {amountField}
              {utrField}
              {dateField}

              <div className="flex w-full flex-col gap-2">
                <label htmlFor="transaction-notes" className="text-sm font-medium text-foreground">
                  Notes
                </label>
                <Textarea
                  id="transaction-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes"
                  className="min-h-[76px] w-full rounded-md border-border bg-white text-sm text-foreground placeholder:text-muted-foreground"
                  disabled={isPending}
                />
              </div>
            </div>
          ) : isRefundDeposit ? (
            <div className="flex w-full flex-col gap-4">
              {productsSingleSelectField}
              {amountField}
              {utrField}
              {bankAccountField}
              {dateField}
              {remarksField}
            </div>
          ) : isAddDeposit ? (
            <div className="flex w-full flex-col gap-4">
              {productsSingleSelectField}
              {amountField}
              {utrField}
              {dateField}
              {remarksField}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="rounded-md"
            disabled={isPending}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-md border-transparent bg-[#8B5CF6] text-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:bg-[#7c3aed] hover:text-white"
          >
            {isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
