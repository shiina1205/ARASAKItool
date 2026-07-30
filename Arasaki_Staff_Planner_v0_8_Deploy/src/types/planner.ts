export type StaffRole = 'owner' | 'operations' | 'staff' | 'cast';
export type TaskStatus = 'inbox' | 'todo' | 'doing' | 'review' | 'waiting' | 'hold' | 'done' | 'cancelled' | 'archived';
export type Priority = '' | 'high' | 'medium' | 'low' | `${1 | 2 | 3}${'A' | 'B' | 'C'}`;
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type WorkspaceKind = 'personal' | 'organization';
export type {
  Category,
  CategoryLevel,
  CategorySelection,
  ClassificationStatus,
  Deliverable,
  GeneratedTaskDefinition,
  ManagementType,
  ProjectPhaseDefinition,
  ProjectPhaseSet,
  ProjectRecord,
  ProjectTemplate,
  ProjectTemplateSnapshot,
  QualityCheck,
  QualityResult,
  RelatedUrl,
  SelectOption,
  TaskRecord,
  TemplateField,
  TemplateInputType,
  TemplateSection,
  TemplateValue,
  TemplateValueMap,
  UserRef,
  Visibility,
} from '../domain/planner-v1/index.ts';

import type {
  Category,
  ClassificationStatus,
  ManagementType,
  ProjectRecord,
  ProjectTemplate,
  RelatedUrl,
  Visibility,
} from '../domain/planner-v1/index.ts';

export interface PlannerWorkspace {
  id: string;
  name: string;
  kind: WorkspaceKind;
  icon?: string;
}

export interface RepeatRule {
  type: RepeatType;
  interval: number;
  until?: string;
  weekdays?: number[];
}

export interface PlannerTask {
  id: string;
  workspaceId: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  completed: boolean;
  managementType?: Extract<ManagementType, 'task' | 'recurring' | 'request'>;
  majorCategoryId?: string;
  middleCategoryId?: string;
  smallCategoryId?: string;
  classificationStatus?: ClassificationStatus;
  visibility?: Visibility;
  projectId?: string;
  templateFieldId?: string;
  phaseId?: string;
  assigneeUids?: string[];
  reviewerUids?: string[];
  tags?: string[];
  relatedUrls?: RelatedUrl[];
  legacyCategory?: string;
  categoryMigrationVersion?: number;
  /** @deprecated Migration compatibility only. */
  category: string;
  due?: string;
  repeat?: RepeatRule;
}

export interface PlannerEvent {
  id: string;
  workspaceId: string;
  title: string;
  date: string;
  endDate?: string;
  category: string;
  allDay: boolean;
  time?: string;
  endTime?: string;
  backgroundColor?: string;
  note?: string;
  isPrivate?: boolean;
  privateOwnerUid?: string;
  repeat?: RepeatRule;
}

export type MeetingAttendance = 'yes' | 'no' | 'maybe';

export interface MeetingResponse {
  status: MeetingAttendance;
  comment?: string;
  name?: string;
  updatedAt: string;
}

export interface PlannerPreferences {
  weekStartsOn: 'monday' | 'sunday';
  showJapaneseHolidays: boolean;
}

export interface PlannerState {
  version?: number;
  categoryMigrationVersion?: number;
  categoryMaster?: Category[];
  projectTemplates?: ProjectTemplate[];
  tasks: PlannerTask[];
  events: PlannerEvent[];
  projects?: ProjectRecord[];
  preferences: PlannerPreferences;
}

export interface StaffUser {
  uid: string;
  displayName?: string;
  name?: string;
  email?: string;
  roleLabel?: string;
  role: StaffRole;
}
