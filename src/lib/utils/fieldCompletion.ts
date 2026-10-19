/**
 * Declarative "mandatory field" completion for multi-section forms.
 * Each section is an ordered list of predicates; scalability = append rules / sections.
 */

export type FieldCompletionRule<TValues> = {
  /** Optional stable id for tests, logging, or analytics */
  id?: string;
  isComplete: (values: TValues) => boolean;
};

export type SectionCompletionResult = {
  totalMandatory: number;
  filledMandatory: number;
  isComplete: boolean;
};

export function evaluateMandatoryFieldCompletion<TValues>(
  rules: readonly FieldCompletionRule<TValues>[],
  values: TValues,
): SectionCompletionResult {
  const totalMandatory = rules.length;
  const filledMandatory = rules.reduce(
    (count, rule) => count + (rule.isComplete(values) ? 1 : 0),
    0,
  );
  return {
    totalMandatory,
    filledMandatory,
    isComplete: totalMandatory > 0 && filledMandatory === totalMandatory,
  };
}
