import type {
  ProjectTemplate,
  ProjectTemplateSnapshot,
  QualityCheck,
  TemplateValueMap,
} from './types.ts';

export interface ProgressTask {
  id: string;
  projectId?: string;
  status?: string;
  completed?: boolean;
  archived?: boolean;
  cancelled?: boolean;
}

export interface ProjectProgressOptions {
  includeOptionalTemplateFields?: boolean;
  includeOptionalQualityChecks?: boolean;
  excludedTaskStatuses?: readonly string[];
}

export interface ProgressCount {
  completed: number;
  total: number;
  percent: number;
  completedIds: string[];
  incompleteIds: string[];
  excludedIds: string[];
}

export interface ProjectProgressResult extends ProgressCount {
  templateFields: ProgressCount;
  tasks: ProgressCount;
  qualityChecks: ProgressCount;
}

export interface ProjectProgressInput {
  projectId: string;
  template?: Pick<ProjectTemplate, 'sections'> | Pick<ProjectTemplateSnapshot, 'sections'>;
  templateValues?: TemplateValueMap;
  tasks?: readonly ProgressTask[];
  qualityChecks?: readonly QualityCheck[];
  options?: ProjectProgressOptions;
}

function countResult(
  completedIds: string[],
  incompleteIds: string[],
  excludedIds: string[],
): ProgressCount {
  const total = completedIds.length + incompleteIds.length;
  return {
    completed: completedIds.length,
    total,
    percent: total ? Math.round((completedIds.length / total) * 100) : 0,
    completedIds,
    incompleteIds,
    excludedIds,
  };
}

function templateFieldProgress(
  template: ProjectProgressInput['template'],
  values: TemplateValueMap,
  includeOptional: boolean,
): ProgressCount {
  const completedIds: string[] = [];
  const incompleteIds: string[] = [];
  const excludedIds: string[] = [];

  for (const field of template?.sections.flatMap(section => section.fields) ?? []) {
    if (!field.completionEnabled || (!field.required && !includeOptional)) {
      excludedIds.push(field.id);
      continue;
    }
    if (values[field.id]?.completed === true) completedIds.push(field.id);
    else incompleteIds.push(field.id);
  }

  return countResult(completedIds, incompleteIds, excludedIds);
}

function taskProgress(
  projectId: string,
  tasks: readonly ProgressTask[],
  excludedStatuses: ReadonlySet<string>,
): ProgressCount {
  const completedIds: string[] = [];
  const incompleteIds: string[] = [];
  const excludedIds: string[] = [];

  for (const task of tasks) {
    if (task.projectId !== projectId) continue;
    if (
      task.archived
      || task.cancelled
      || (task.status && excludedStatuses.has(task.status))
    ) {
      excludedIds.push(task.id);
      continue;
    }
    if (task.status === 'done' || task.completed === true) completedIds.push(task.id);
    else incompleteIds.push(task.id);
  }

  return countResult(completedIds, incompleteIds, excludedIds);
}

function qualityProgress(
  projectId: string,
  qualityChecks: readonly QualityCheck[],
  includeOptional: boolean,
): ProgressCount {
  const completedIds: string[] = [];
  const incompleteIds: string[] = [];
  const excludedIds: string[] = [];

  for (const check of qualityChecks) {
    if (check.projectId !== projectId) continue;
    if (check.result === 'notApplicable' || (!check.required && !includeOptional)) {
      excludedIds.push(check.id);
      continue;
    }
    if (check.result === 'passed') completedIds.push(check.id);
    else incompleteIds.push(check.id);
  }

  return countResult(completedIds, incompleteIds, excludedIds);
}

/**
 * Calculates, but never persists, project progress. Pass the complete
 * project-task set: using v0.8's role-filtered `visibleTasks()` would make the
 * percentage differ by viewer.
 */
export function calculateProjectProgress(
  input: ProjectProgressInput,
): ProjectProgressResult {
  const options = input.options ?? {};
  const templateFields = templateFieldProgress(
    input.template,
    input.templateValues ?? {},
    options.includeOptionalTemplateFields ?? false,
  );
  const tasks = taskProgress(
    input.projectId,
    input.tasks ?? [],
    new Set(options.excludedTaskStatuses ?? ['archived', 'cancelled']),
  );
  const qualityChecks = qualityProgress(
    input.projectId,
    input.qualityChecks ?? [],
    options.includeOptionalQualityChecks ?? false,
  );

  const completedIds = [
    ...templateFields.completedIds.map(id => `field:${id}`),
    ...tasks.completedIds.map(id => `task:${id}`),
    ...qualityChecks.completedIds.map(id => `qa:${id}`),
  ];
  const incompleteIds = [
    ...templateFields.incompleteIds.map(id => `field:${id}`),
    ...tasks.incompleteIds.map(id => `task:${id}`),
    ...qualityChecks.incompleteIds.map(id => `qa:${id}`),
  ];
  const excludedIds = [
    ...templateFields.excludedIds.map(id => `field:${id}`),
    ...tasks.excludedIds.map(id => `task:${id}`),
    ...qualityChecks.excludedIds.map(id => `qa:${id}`),
  ];

  return {
    ...countResult(completedIds, incompleteIds, excludedIds),
    templateFields,
    tasks,
    qualityChecks,
  };
}
