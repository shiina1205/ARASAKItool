import {
  CATEGORY_INDEX,
  isCategorySelectionValid,
  reconcileCategorySelection,
} from './catalog.ts';
import type {
  CategorySelection,
  ClassificationStatus,
  LegacyPlannerRecord,
  ManagementType,
  Visibility,
} from './types.ts';

export const CATEGORY_MIGRATION_VERSION = 1;

export type LegacyCollectionName =
  | 'tasks'
  | 'events'
  | 'projects'
  | 'meetings'
  | 'schedulePolls'
  | 'notes'
  | 'futureItems';

export interface LegacyCategoryMapping {
  majorCategoryId: string;
  middleCategoryId?: string;
  smallCategoryId?: string;
  phaseId?: string;
}

/**
 * Includes both the attached specification's seven old values and values
 * observed in the current v0.8 defaultSettings / older migrations.
 */
export const LEGACY_CATEGORY_MAPPING: Readonly<Record<string, LegacyCategoryMapping>> = {
  '全体': { majorCategoryId: 'CAT-UNC' },
  '企画・進行': { majorCategoryId: 'CAT-PLN' },
  '企画': { majorCategoryId: 'CAT-PLN' },
  '人事': { majorCategoryId: 'CAT-HR' },
  '総務': { majorCategoryId: 'CAT-GA' },
  '情報システム': { majorCategoryId: 'CAT-IT' },
  '制作': { majorCategoryId: 'CAT-PRD' },
  'ワールド制作': {
    majorCategoryId: 'CAT-PRD',
    middleCategoryId: 'CAT-PRD-WORLD',
  },
  '小物・制作': {
    majorCategoryId: 'CAT-PRD',
    middleCategoryId: 'CAT-PRD-PROP',
  },
  '小物制作': {
    majorCategoryId: 'CAT-PRD',
    middleCategoryId: 'CAT-PRD-PROP',
  },
  '広報': { majorCategoryId: 'CAT-PR' },
  'SNS・広報': {
    majorCategoryId: 'CAT-PR',
    middleCategoryId: 'CAT-PR-POSTING',
  },
  '品質確認': { majorCategoryId: 'CAT-QA' },
  '当日運営': {
    majorCategoryId: 'CAT-PLN',
    middleCategoryId: 'CAT-PLN-EVENT',
    phaseId: 'preparation',
  },
  '未分類': { majorCategoryId: 'CAT-UNC' },
  // Old personal/generic values found on organization records cannot be
  // classified safely. Explicit personal-workspace records are skipped.
  '個人': { majorCategoryId: 'CAT-UNC' },
  '仕事': { majorCategoryId: 'CAT-UNC' },
  '荒嵜造船所': { majorCategoryId: 'CAT-UNC' },
  'OKEANOS': { majorCategoryId: 'CAT-UNC' },
  'PRIVATE': { majorCategoryId: 'CAT-UNC' },
  'LIFE': { majorCategoryId: 'CAT-UNC' },
  'WORK': { majorCategoryId: 'CAT-UNC' },
  'VRchat': { majorCategoryId: 'CAT-UNC' },
};

const CURRENT_TASK_TYPE_REFINEMENTS: Readonly<Record<string, LegacyCategoryMapping>> = {
  '人事__1': { majorCategoryId: 'CAT-HR', middleCategoryId: 'CAT-HR-RECRUIT' },
  '人事__2': { majorCategoryId: 'CAT-HR', middleCategoryId: 'CAT-HR-FOLLOWUP' },
  '人事__3': { majorCategoryId: 'CAT-HR', middleCategoryId: 'CAT-HR-ONBOARD' },
  '総務__1': { majorCategoryId: 'CAT-GA', middleCategoryId: 'CAT-GA-COMMS' },
  '総務__2': { majorCategoryId: 'CAT-GA', middleCategoryId: 'CAT-GA-COMMS' },
  '総務__3': { majorCategoryId: 'CAT-GA', middleCategoryId: 'CAT-GA-COMMS' },
  '総務__4': { majorCategoryId: 'CAT-GA', middleCategoryId: 'CAT-GA-COMMS' },
  '総務__5': { majorCategoryId: 'CAT-GA', middleCategoryId: 'CAT-GA-MEETING' },
  '情報システム__1': { majorCategoryId: 'CAT-IT', middleCategoryId: 'CAT-IT-ACCESS' },
  '情報システム__2': { majorCategoryId: 'CAT-IT', middleCategoryId: 'CAT-IT-ACCESS' },
  '情報システム__3': { majorCategoryId: 'CAT-IT', middleCategoryId: 'CAT-IT-ACCESS' },
};

export interface CategoryMigrationContext {
  collection: LegacyCollectionName;
  personalWorkspaceIds?: readonly string[];
  liveOperationsPhaseId?: 'preparation' | 'execution';
}

function inferredManagementType(
  record: LegacyPlannerRecord,
  collection: LegacyCollectionName,
): ManagementType {
  if (record.managementType) return record.managementType;
  if (collection === 'projects') return 'project';
  if (collection === 'meetings' || collection === 'schedulePolls') return 'meeting';
  if (collection === 'tasks') {
    return record.repeatType && record.repeatType !== 'none' ? 'recurring' : 'task';
  }
  if (collection === 'notes') {
    const type = String(record.type ?? '');
    return type === 'アイデア' || type.toLowerCase() === 'idea' ? 'idea' : 'record';
  }
  if (collection === 'futureItems') return 'idea';
  return 'record';
}

function inferredVisibility(
  record: LegacyPlannerRecord,
  collection: LegacyCollectionName,
): Visibility {
  if (record.visibility) return record.visibility;
  if (
    collection === 'tasks'
    && (record.audience === 'operations'
      || record.audience === 'staff'
      || record.audience === 'cast')
  ) {
    return record.audience;
  }
  // Flat v0.8 collections were visible to every active member. `cast`
  // preserves that behavior; sensitive records need an explicit manual review.
  return 'cast';
}

function mappingFor(record: LegacyPlannerRecord): LegacyCategoryMapping {
  const rawCategory = String(record.category ?? record.legacyCategory ?? '').trim();
  const taskType = String(record.type ?? '').trim();
  const categoryMapping = LEGACY_CATEGORY_MAPPING[rawCategory];
  const refinement = CURRENT_TASK_TYPE_REFINEMENTS[taskType];

  if (
    refinement
    && categoryMapping
    && refinement.majorCategoryId === categoryMapping.majorCategoryId
  ) {
    return refinement;
  }
  if (categoryMapping) return categoryMapping;

  const categoryById = CATEGORY_INDEX.byId.get(rawCategory);
  if (categoryById?.level === 1) return { majorCategoryId: categoryById.id };
  if (categoryById?.level === 2) {
    return {
      majorCategoryId: categoryById.parentId ?? 'CAT-UNC',
      middleCategoryId: categoryById.id,
    };
  }
  if (categoryById?.level === 3) {
    const middle = categoryById.parentId
      ? CATEGORY_INDEX.byId.get(categoryById.parentId)
      : undefined;
    return {
      majorCategoryId: middle?.parentId ?? 'CAT-UNC',
      middleCategoryId: middle?.id,
      smallCategoryId: categoryById.id,
    };
  }
  return { majorCategoryId: 'CAT-UNC' };
}

export function requiresCategoryClassification(
  record: Partial<LegacyPlannerRecord>,
): boolean {
  if (record.classificationStatus === 'needs-classification') return true;
  if (!record.majorCategoryId || record.majorCategoryId === 'CAT-UNC') return true;
  if (
    !isCategorySelectionValid({
      majorCategoryId: record.majorCategoryId,
      middleCategoryId: record.middleCategoryId,
      smallCategoryId: record.smallCategoryId,
    })
  ) {
    return true;
  }
  return record.managementType !== 'idea' && !record.middleCategoryId;
}

export function migrateLegacyRecordCategories<T extends LegacyPlannerRecord>(
  record: T,
  context: CategoryMigrationContext,
): T {
  const personalWorkspaceIds = new Set(context.personalWorkspaceIds ?? ['personal']);
  if (record.workspaceId && personalWorkspaceIds.has(record.workspaceId)) {
    return { ...record };
  }
  if (
    Number(record.categoryMigrationVersion) >= CATEGORY_MIGRATION_VERSION
    && record.majorCategoryId
  ) {
    return { ...record };
  }

  const managementType = inferredManagementType(record, context.collection);
  const visibility = inferredVisibility(record, context.collection);
  const rawCategory = String(record.category ?? record.legacyCategory ?? '').trim();

  let selection: Partial<CategorySelection>;
  let mappedPhaseId: string | undefined;
  if (record.majorCategoryId) {
    selection = {
      majorCategoryId: record.majorCategoryId,
      middleCategoryId: record.middleCategoryId,
      smallCategoryId: record.smallCategoryId,
    };
  } else {
    const mapping = mappingFor(record);
    selection = reconcileCategorySelection(mapping);
    mappedPhaseId = mapping.phaseId;
  }

  const withCategory = {
    ...record,
    ...selection,
    managementType,
    visibility,
    ...(rawCategory ? { legacyCategory: rawCategory } : {}),
    ...(record.phaseId
      ? {}
      : mappedPhaseId
        ? {
            phaseId:
              rawCategory === '当日運営'
                ? context.liveOperationsPhaseId ?? mappedPhaseId
                : mappedPhaseId,
          }
        : {}),
    categoryMigrationVersion: CATEGORY_MIGRATION_VERSION,
  } as T;

  const classificationStatus: ClassificationStatus =
    requiresCategoryClassification(withCategory)
      ? 'needs-classification'
      : 'classified';

  return { ...withCategory, classificationStatus };
}

export interface CategoryMigrationReport {
  examined: number;
  changed: number;
  skippedPersonal: number;
  needsClassification: number;
  byCollection: Partial<Record<LegacyCollectionName, number>>;
}

export interface MigratedPlannerState<T extends Record<string, unknown>> {
  state: T & { categoryMigrationVersion: number };
  report: CategoryMigrationReport;
}

const MIGRATED_COLLECTIONS: readonly LegacyCollectionName[] = [
  'tasks',
  'events',
  'projects',
  'meetings',
  'schedulePolls',
  'notes',
  'futureItems',
];

/**
 * Pure state migration for the current array-based planner state. It does not
 * mutate the source. Re-running it produces an equal state because each record
 * carries categoryMigrationVersion.
 */
export function migrateLegacyPlannerState<T extends Record<string, unknown>>(
  source: T,
  options: Omit<CategoryMigrationContext, 'collection'> = {},
): MigratedPlannerState<T> {
  const next = { ...source } as T & { categoryMigrationVersion: number };
  const report: CategoryMigrationReport = {
    examined: 0,
    changed: 0,
    skippedPersonal: 0,
    needsClassification: 0,
    byCollection: {},
  };
  const personalWorkspaceIds = new Set(options.personalWorkspaceIds ?? ['personal']);

  for (const collection of MIGRATED_COLLECTIONS) {
    const records = source[collection];
    if (!Array.isArray(records)) continue;
    const migrated = records.map(value => {
      if (!value || typeof value !== 'object') return value;
      const record = value as LegacyPlannerRecord;
      report.examined += 1;
      if (record.workspaceId && personalWorkspaceIds.has(record.workspaceId)) {
        report.skippedPersonal += 1;
      }
      const result = migrateLegacyRecordCategories(record, {
        ...options,
        collection,
      });
      if (JSON.stringify(result) !== JSON.stringify(record)) {
        report.changed += 1;
        report.byCollection[collection] = (report.byCollection[collection] ?? 0) + 1;
      }
      if (result.classificationStatus === 'needs-classification') {
        report.needsClassification += 1;
      }
      return result;
    });
    (next as Record<string, unknown>)[collection] = migrated;
  }

  next.categoryMigrationVersion = CATEGORY_MIGRATION_VERSION;
  return { state: next, report };
}
