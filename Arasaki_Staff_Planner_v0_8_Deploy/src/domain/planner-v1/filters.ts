import { requiresCategoryClassification } from './migration.ts';
import type {
  LegacyPlannerRecord,
  ManagementType,
  Visibility,
} from './types.ts';

export type OneOrMany<T> = T | readonly T[];

export interface PlannerFilter {
  query?: string;
  workspaceId?: OneOrMany<string>;
  majorCategoryId?: OneOrMany<string>;
  middleCategoryId?: OneOrMany<string>;
  smallCategoryId?: OneOrMany<string>;
  managementType?: OneOrMany<ManagementType>;
  projectId?: OneOrMany<string>;
  phaseId?: OneOrMany<string>;
  status?: OneOrMany<string>;
  assigneeUid?: OneOrMany<string>;
  reviewerUid?: OneOrMany<string>;
  visibility?: OneOrMany<Visibility>;
  tag?: OneOrMany<string>;
  dueFrom?: string;
  dueTo?: string;
  templateId?: OneOrMany<string>;
  needsClassification?: boolean;
}

function asArray<T>(value: OneOrMany<T> | undefined): readonly T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value as T];
}

function matchesValue<T>(
  actual: T | undefined,
  expected: OneOrMany<T> | undefined,
): boolean {
  const values = asArray(expected);
  return values.length === 0 || (actual !== undefined && values.includes(actual));
}

function normalizedUidList(value: unknown, singular: unknown): string[] {
  const list = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : [];
  if (typeof singular === 'string' && singular && !list.includes(singular)) list.push(singular);
  return list;
}

function intersects(actual: readonly string[], expected: OneOrMany<string> | undefined): boolean {
  const values = asArray(expected);
  return values.length === 0 || values.some(value => actual.includes(value));
}

function recordVisibility(record: LegacyPlannerRecord): Visibility | undefined {
  if (record.visibility) return record.visibility;
  if (
    record.audience === 'operations'
    || record.audience === 'staff'
    || record.audience === 'cast'
  ) {
    return record.audience;
  }
  return undefined;
}

function searchableText(record: LegacyPlannerRecord): string {
  const values = [
    record.title,
    record.name,
    record.legacyCategory,
    record.note,
    record.content,
    record.purpose,
    record.completionCriteria,
    ...(Array.isArray(record.tags) ? record.tags : []),
  ];
  return values
    .filter(value => typeof value === 'string')
    .join(' ')
    .normalize('NFKC')
    .toLocaleLowerCase('ja');
}

/**
 * One predicate for the spec's list filters. It understands both new plural
 * assignee/reviewer fields and the current v0.8 singular fields.
 */
export function matchesPlannerFilter(
  record: LegacyPlannerRecord,
  filter: PlannerFilter,
): boolean {
  if (!matchesValue(record.workspaceId, filter.workspaceId)) return false;
  if (!matchesValue(record.majorCategoryId, filter.majorCategoryId)) return false;
  if (!matchesValue(record.middleCategoryId, filter.middleCategoryId)) return false;
  if (!matchesValue(record.smallCategoryId, filter.smallCategoryId)) return false;
  if (!matchesValue(record.managementType, filter.managementType)) return false;
  if (!matchesValue(record.projectId, filter.projectId)) return false;
  if (!matchesValue(record.phaseId, filter.phaseId)) return false;
  if (!matchesValue(record.status, filter.status)) return false;
  if (!matchesValue(record.templateId, filter.templateId)) return false;
  if (!matchesValue(recordVisibility(record), filter.visibility)) return false;

  const assignees = normalizedUidList(record.assigneeUids, record.assigneeUid);
  if (!intersects(assignees, filter.assigneeUid)) return false;
  const reviewers = normalizedUidList(record.reviewerUids, record.reviewerUid);
  if (!intersects(reviewers, filter.reviewerUid)) return false;

  const tags = Array.isArray(record.tags)
    ? record.tags.filter((item): item is string => typeof item === 'string')
    : [];
  if (!intersects(tags, filter.tag)) return false;

  const due = String(record.dueDate ?? record.due ?? '');
  if (filter.dueFrom && (!due || due < filter.dueFrom)) return false;
  if (filter.dueTo && (!due || due > filter.dueTo)) return false;

  if (
    filter.needsClassification !== undefined
    && requiresCategoryClassification(record) !== filter.needsClassification
  ) {
    return false;
  }

  const query = filter.query?.trim().normalize('NFKC').toLocaleLowerCase('ja');
  return !query || searchableText(record).includes(query);
}

export function filterPlannerRecords<T extends LegacyPlannerRecord>(
  records: readonly T[],
  filter: PlannerFilter,
): T[] {
  return records.filter(record => matchesPlannerFilter(record, filter));
}
