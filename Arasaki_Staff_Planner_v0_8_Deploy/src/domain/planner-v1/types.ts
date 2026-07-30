export type CategoryLevel = 1 | 2 | 3;

export type ManagementType =
  | 'idea'
  | 'project'
  | 'task'
  | 'meeting'
  | 'request'
  | 'recurring'
  | 'record';

export type Visibility = 'owner' | 'operations' | 'staff' | 'cast';

export type ClassificationStatus = 'classified' | 'needs-classification';

export type TaskStatus =
  | 'inbox'
  | 'todo'
  | 'doing'
  | 'review'
  | 'waiting'
  | 'hold'
  | 'done'
  | 'cancelled'
  | 'archived';

export interface UserRef {
  uid: string;
  displayName: string;
  email?: string;
}

export interface Category {
  id: string;
  level: CategoryLevel;
  parentId: string | null;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  active: boolean;
  system?: boolean;
}

export interface CategorySelection {
  majorCategoryId: string;
  middleCategoryId?: string;
  smallCategoryId?: string;
}

export interface CategorizedRecord extends Partial<CategorySelection> {
  category?: string;
  legacyCategory?: string;
  categoryMigrationVersion?: number;
  classificationStatus?: ClassificationStatus;
}

export interface ProjectPhaseSet {
  id: string;
  name: string;
  description: string;
  active: boolean;
  phases: ProjectPhaseDefinition[];
}

export interface ProjectPhaseDefinition {
  id: string;
  phaseSetId: string;
  name: string;
  description: string;
  sortOrder: number;
  terminal?: boolean;
  archived?: boolean;
}

export interface TemplatePhase {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  initial?: boolean;
  terminal?: boolean;
}

export type TemplateInputType =
  | 'shortText'
  | 'longText'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'datetimeRange'
  | 'checkbox'
  | 'singleSelect'
  | 'multiSelect'
  | 'userSelect'
  | 'userChecklist'
  | 'url'
  | 'fileLink'
  | 'result'
  | 'externalTool'
  | 'richList';

export interface SelectOption {
  value: string;
  label: string;
}

export interface RichListColumn {
  id: string;
  label: string;
  inputType: Exclude<TemplateInputType, 'richList'>;
  required: boolean;
  placeholder?: string;
}

export interface TemplateField {
  id: string;
  label: string;
  description?: string;
  inputType: TemplateInputType;
  required: boolean;
  defaultValue?: unknown;
  options?: SelectOption[];
  completionEnabled: boolean;
  assigneeEnabled: boolean;
  reviewerEnabled: boolean;
  dueDateEnabled: boolean;
  externalToolHint?: string;
  richListColumns?: RichListColumn[];
  sortOrder: number;
}

export interface TemplateSection {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  fields: TemplateField[];
}

export interface GeneratedTaskDefinition {
  id: string;
  title: string;
  description?: string;
  managementType: Extract<ManagementType, 'task' | 'request' | 'recurring'>;
  phaseId?: string;
  middleCategoryId?: string;
  smallCategoryId?: string;
  status: TaskStatus;
  priority?: string;
  required: boolean;
  assigneeFromFieldId?: string;
  reviewerFromFieldId?: string;
  dueDateFromFieldId?: string;
  visibility?: Visibility;
  sortOrder: number;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  majorCategoryId: string;
  middleCategoryId?: string;
  version: number;
  active: boolean;
  defaultVisibility: Visibility;
  phases: TemplatePhase[];
  sections: TemplateSection[];
  generatedTasks: GeneratedTaskDefinition[];
}

export interface ProjectTemplateSnapshot {
  templateId: string;
  templateVersion: number;
  templateName: string;
  capturedAt: string;
  phases: TemplatePhase[];
  sections: TemplateSection[];
  generatedTasks: GeneratedTaskDefinition[];
}

export interface TemplateValue {
  value: unknown;
  completed: boolean;
  completedAt?: string;
  completedBy?: UserRef;
  assigneeUids?: string[];
  reviewerUids?: string[];
  dueDate?: string;
}

export type TemplateValueMap = Record<string, TemplateValue>;

export type RelatedToolType =
  | 'discord'
  | 'googleDrive'
  | 'googleDocs'
  | 'googleSheets'
  | 'googleForms'
  | 'chouseisan'
  | 'github'
  | 'vrchat'
  | 'x'
  | 'other';

export interface RelatedUrl {
  id: string;
  toolType: RelatedToolType;
  label: string;
  url: string;
}

export interface Deliverable {
  id: string;
  name: string;
  status?: string;
  relatedUrls?: RelatedUrl[];
}

export interface ProjectRecord extends CategorySelection {
  id: string;
  workspaceId: string;
  managementType: 'project';
  name: string;
  templateId?: string;
  templateVersion?: number;
  templateSnapshot?: ProjectTemplateSnapshot;
  phaseId: string;
  purpose?: string;
  completionCriteria?: string;
  ownerUid: string;
  memberUids: string[];
  startDate?: string;
  endDate?: string;
  visibility: Visibility;
  relatedEventIds: string[];
  relatedProjectIds: string[];
  deliverables: Deliverable[];
  templateValues: TemplateValueMap;
  classificationStatus: ClassificationStatus;
  legacyCategory?: string;
  categoryMigrationVersion?: number;
  createdBy: UserRef;
  createdAt: string;
  updatedBy: UserRef;
  updatedAt: string;
}

export interface TaskRecord extends CategorySelection {
  id: string;
  workspaceId: string;
  title: string;
  managementType: Extract<ManagementType, 'task' | 'recurring' | 'request'>;
  projectId?: string;
  templateFieldId?: string;
  generatedTaskDefinitionId?: string;
  phaseId?: string;
  status: TaskStatus;
  priority?: string;
  assigneeUids: string[];
  reviewerUids: string[];
  dueDate?: string;
  visibility: Visibility;
  relatedUrls: RelatedUrl[];
  tags: string[];
  classificationStatus: ClassificationStatus;
  legacyCategory?: string;
  categoryMigrationVersion?: number;
  createdBy: UserRef;
  createdAt: string;
  updatedBy: UserRef;
  updatedAt: string;
}

export type QualityResult =
  | 'unchecked'
  | 'passed'
  | 'needsRevision'
  | 'notApplicable';

export interface QualityCheck {
  id: string;
  projectId: string;
  label: string;
  required: boolean;
  result: QualityResult;
  reviewerUid?: string;
  reviewedAt?: string;
  targetVersion?: string;
}

/**
 * Current v0.8 records are intentionally structural rather than exact types.
 * The migration keeps all unknown properties so the legacy runtime can continue
 * to render and sync the same object while the new fields are rolled out.
 */
export interface LegacyPlannerRecord extends CategorizedRecord {
  id: string;
  workspaceId?: string;
  title?: string;
  name?: string;
  type?: string;
  status?: string;
  completed?: boolean;
  repeatType?: string;
  audience?: string;
  visibility?: Visibility;
  projectId?: string;
  phaseId?: string;
  managementType?: ManagementType;
  assigneeUid?: string;
  assigneeUids?: string[];
  reviewerUid?: string;
  reviewerUids?: string[];
  due?: string;
  dueDate?: string;
  tags?: string[];
  templateId?: string;
  [key: string]: unknown;
}
