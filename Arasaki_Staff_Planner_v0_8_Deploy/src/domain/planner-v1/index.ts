export * from './types.ts';
export * from './catalog.ts';
export * from './phases.ts';
export * from './event-template.ts';
export * from './migration.ts';
export * from './filters.ts';
export * from './progress.ts';
export * from './access-control.ts';
export * from './surface-access.ts';

import {
  INITIAL_CATEGORY_MASTER,
  validateCategoryMaster,
} from './catalog.ts';
import {
  EVENT_PROJECT_TEMPLATE,
  PROJECT_TEMPLATES,
  validateProjectTemplate,
} from './event-template.ts';
import { CATEGORY_MIGRATION_VERSION } from './migration.ts';
import { validatePhaseSets } from './phases.ts';
import type { Category, ProjectTemplate } from './types.ts';

export const PLANNER_DOMAIN_SCHEMA_VERSION = 1;

export interface InitialPlannerDomainState {
  categoryMaster: Category[];
  projectTemplates: ProjectTemplate[];
  categoryMigrationVersion: number;
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createInitialPlannerDomainState(): InitialPlannerDomainState {
  return {
    categoryMaster: cloneJson([...INITIAL_CATEGORY_MASTER]),
    projectTemplates: cloneJson([...PROJECT_TEMPLATES]),
    categoryMigrationVersion: CATEGORY_MIGRATION_VERSION,
  };
}

export function validatePlannerDomain(): string[] {
  return [
    ...validateCategoryMaster(),
    ...validatePhaseSets(),
    ...validateProjectTemplate(EVENT_PROJECT_TEMPLATE),
  ];
}
