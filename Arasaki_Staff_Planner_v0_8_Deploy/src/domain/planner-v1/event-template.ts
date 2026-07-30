import { QUALITY_RESULTS } from './catalog.ts';
import { EVENT_PHASE_SET, phaseSetToTemplatePhases } from './phases.ts';
import type {
  GeneratedTaskDefinition,
  ProjectTemplate,
  ProjectTemplateSnapshot,
  SelectOption,
  TemplateField,
  TemplateValueMap,
} from './types.ts';

type TemplateFieldSeed = Omit<TemplateField, 'sortOrder'>;

const RESULT_OPTIONS: SelectOption[] = QUALITY_RESULTS.map(item => ({ ...item }));

const VISIBILITY_OPTIONS: SelectOption[] = [
  { value: 'owner', label: 'オーナーのみ' },
  { value: 'operations', label: 'オーナー・運営' },
  { value: 'staff', label: 'オーナー・運営・スタッフ' },
  { value: 'cast', label: '全登録ユーザー' },
];

function orderedFields(items: readonly TemplateFieldSeed[]): TemplateField[] {
  return items.map((item, index) => ({ ...item, sortOrder: index + 1 }));
}

function simpleField(
  id: string,
  label: string,
  inputType: TemplateField['inputType'],
  options: Partial<TemplateFieldSeed> = {},
): TemplateFieldSeed {
  return {
    id,
    label,
    inputType,
    required: false,
    completionEnabled: false,
    assigneeEnabled: false,
    reviewerEnabled: false,
    dueDateEnabled: false,
    ...options,
  };
}

const basicFields = orderedFields([
  simpleField('event-basic-name', '企画名', 'shortText', {
    description: 'プロジェクト名と同じ値を初期表示し、テンプレートのスナップショットにも保持する。',
    required: true,
    completionEnabled: true,
  }),
  simpleField('event-basic-owner', '企画責任者', 'userSelect', {
    required: true,
    completionEnabled: true,
    assigneeEnabled: true,
  }),
  simpleField('event-basic-concept', 'コンセプト', 'longText', {
    required: true,
    completionEnabled: true,
  }),
  simpleField('event-basic-audience', '対象者', 'longText', {
    required: true,
    completionEnabled: true,
  }),
  simpleField('event-basic-purpose', '開催目的', 'longText', {
    required: true,
    completionEnabled: true,
  }),
  simpleField('event-basic-details', '企画内容', 'longText', {
    required: true,
    completionEnabled: true,
  }),
  simpleField('event-basic-participation', '参加方法', 'longText', {
    required: true,
    completionEnabled: true,
  }),
  simpleField('event-basic-completion-criteria', '完了条件', 'richList', {
    required: true,
    completionEnabled: true,
    defaultValue: [],
    richListColumns: [
      { id: 'criterion', label: '完了条件', inputType: 'shortText', required: true },
      { id: 'note', label: '補足', inputType: 'longText', required: false },
    ],
  }),
  simpleField('event-basic-success-criteria', '成功条件', 'richList', {
    completionEnabled: true,
    defaultValue: [],
    richListColumns: [
      { id: 'indicator', label: '指標', inputType: 'shortText', required: true },
      { id: 'target', label: '目標', inputType: 'shortText', required: true },
      { id: 'method', label: '測定方法', inputType: 'shortText', required: false },
    ],
  }),
  simpleField('event-basic-visibility', '公開範囲', 'singleSelect', {
    required: true,
    defaultValue: 'staff',
    options: VISIBILITY_OPTIONS,
  }),
]);

const scheduleFields = orderedFields([
  simpleField('event-plan-datetime', '開始日時・終了日時', 'datetimeRange', {
    required: true,
    completionEnabled: true,
    dueDateEnabled: true,
  }),
  simpleField('event-plan-venue', 'ワールド・会場', 'externalTool', {
    required: true,
    completionEnabled: true,
    externalToolHint: 'VRChatワールド名、会場名、world URLを保存する。',
  }),
  simpleField('event-plan-capacity', '定員', 'number', {
    required: true,
    completionEnabled: true,
  }),
  simpleField('event-plan-instance-count', 'インスタンス数', 'number', {
    required: true,
    completionEnabled: true,
    defaultValue: 1,
  }),
  simpleField('event-plan-required-staff', '必要スタッフ', 'richList', {
    required: true,
    completionEnabled: true,
    assigneeEnabled: true,
    defaultValue: [],
    richListColumns: [
      { id: 'role', label: '役割', inputType: 'shortText', required: true },
      { id: 'count', label: '必要人数', inputType: 'number', required: true },
      { id: 'note', label: '条件・補足', inputType: 'longText', required: false },
    ],
  }),
  simpleField('event-plan-budget-limit', '予算上限', 'currency', {
    completionEnabled: true,
  }),
  simpleField('event-plan-planned-spend', '使用予定額', 'currency', {
    completionEnabled: true,
  }),
  simpleField('event-plan-stakeholders', '関係者', 'userChecklist', {
    defaultValue: [],
    assigneeEnabled: true,
  }),
  simpleField('event-plan-related-events', '関連イベント', 'richList', {
    defaultValue: [],
    richListColumns: [
      { id: 'name', label: 'イベント名', inputType: 'shortText', required: true },
      { id: 'url', label: 'URL', inputType: 'url', required: false },
      { id: 'relationship', label: '関係', inputType: 'shortText', required: false },
    ],
  }),
]);

const contentFields = orderedFields([
  simpleField('event-content-program', '実施内容', 'richList', {
    required: true,
    completionEnabled: true,
    defaultValue: [],
    richListColumns: [
      { id: 'title', label: '内容', inputType: 'shortText', required: true },
      { id: 'description', label: '詳細', inputType: 'longText', required: false },
      { id: 'owner', label: '担当', inputType: 'userSelect', required: false },
    ],
  }),
  simpleField('event-content-experience', '参加者体験', 'longText', {
    required: true,
    completionEnabled: true,
  }),
  simpleField('event-content-performers', '出演者', 'userChecklist', {
    defaultValue: [],
    assigneeEnabled: true,
  }),
  simpleField('event-content-exhibitions', '展示内容', 'richList', {
    defaultValue: [],
    richListColumns: [
      { id: 'title', label: '展示', inputType: 'shortText', required: true },
      { id: 'owner', label: '担当', inputType: 'userSelect', required: false },
      { id: 'url', label: '関連URL', inputType: 'url', required: false },
    ],
  }),
  simpleField('event-content-direction', '演出', 'longText', {
    completionEnabled: true,
  }),
  simpleField('event-content-deliverables', '必要制作物', 'richList', {
    required: true,
    completionEnabled: true,
    assigneeEnabled: true,
    reviewerEnabled: true,
    dueDateEnabled: true,
    defaultValue: [],
    richListColumns: [
      { id: 'deliverable', label: '制作物', inputType: 'shortText', required: true },
      { id: 'owner', label: '担当', inputType: 'userSelect', required: false },
      { id: 'reviewer', label: '確認担当', inputType: 'userSelect', required: false },
      { id: 'dueDate', label: '期限', inputType: 'date', required: false },
      { id: 'url', label: '成果物URL', inputType: 'fileLink', required: false },
    ],
  }),
  simpleField('event-content-precautions', '注意事項', 'longText', {
    completionEnabled: true,
  }),
]);

const operationsFields = orderedFields([
  simpleField('event-operations-timeline', 'タイムスケジュール', 'richList', {
    required: true,
    completionEnabled: true,
    assigneeEnabled: true,
    defaultValue: [],
    richListColumns: [
      { id: 'startTime', label: '開始時刻', inputType: 'shortText', required: true, placeholder: '20:00' },
      { id: 'endTime', label: '終了時刻', inputType: 'shortText', required: true, placeholder: '20:15' },
      { id: 'content', label: '内容', inputType: 'shortText', required: true },
      { id: 'owner', label: '担当', inputType: 'userSelect', required: false },
      { id: 'instance', label: 'インスタンス', inputType: 'shortText', required: false },
      { id: 'note', label: '備考', inputType: 'longText', required: false },
    ],
  }),
  simpleField('event-operations-mc-script', '司会台本', 'fileLink', {
    completionEnabled: true,
    reviewerEnabled: true,
    externalToolHint: 'Google Docs等の台本URLを保存する。',
  }),
  simpleField('event-operations-staff-assignments', 'スタッフ配置', 'richList', {
    required: true,
    completionEnabled: true,
    assigneeEnabled: true,
    defaultValue: [],
    richListColumns: [
      { id: 'staff', label: 'スタッフ', inputType: 'userSelect', required: true },
      { id: 'role', label: '役割', inputType: 'shortText', required: true },
      { id: 'location', label: '配置場所', inputType: 'shortText', required: false },
      { id: 'startTime', label: '開始時刻', inputType: 'shortText', required: false },
      { id: 'endTime', label: '終了時刻', inputType: 'shortText', required: false },
      { id: 'note', label: '備考', inputType: 'longText', required: false },
    ],
  }),
  simpleField('event-operations-instance-structure', 'インスタンス構成', 'richList', {
    required: true,
    completionEnabled: true,
    defaultValue: [],
    richListColumns: [
      { id: 'instance', label: 'インスタンス', inputType: 'shortText', required: true },
      { id: 'purpose', label: '用途', inputType: 'shortText', required: true },
      { id: 'owner', label: '管理担当', inputType: 'userSelect', required: false },
      { id: 'capacity', label: '定員', inputType: 'number', required: false },
    ],
  }),
  simpleField('event-operations-participant-guide', '参加者案内', 'longText', {
    required: true,
    completionEnabled: true,
    reviewerEnabled: true,
  }),
  simpleField('event-operations-meeting-place', '集合場所', 'shortText', {
    required: true,
    completionEnabled: true,
  }),
  simpleField('event-operations-rehearsal', 'リハーサル', 'datetime', {
    required: true,
    completionEnabled: true,
    assigneeEnabled: true,
    reviewerEnabled: true,
    dueDateEnabled: true,
  }),
  simpleField('event-operations-emergency', '緊急時対応', 'longText', {
    required: true,
    completionEnabled: true,
    reviewerEnabled: true,
  }),
  simpleField('event-operations-cancellation', '中止・延期基準', 'longText', {
    required: true,
    completionEnabled: true,
    reviewerEnabled: true,
  }),
]);

const riskFields = orderedFields([
  simpleField('event-risk-venue-fallback', 'ワールド利用不能時の代替', 'longText', {
    required: true,
    completionEnabled: true,
    reviewerEnabled: true,
  }),
  simpleField('event-risk-staff-absence', 'スタッフ欠員対応', 'longText', {
    required: true,
    completionEnabled: true,
    reviewerEnabled: true,
  }),
  simpleField('event-risk-instance-failure', 'インスタンス障害対応', 'longText', {
    required: true,
    completionEnabled: true,
    reviewerEnabled: true,
  }),
  simpleField('event-risk-disruption', '荒らし対応', 'longText', {
    required: true,
    completionEnabled: true,
    reviewerEnabled: true,
  }),
  simpleField('event-risk-media-consent', '撮影・掲載許可', 'result', {
    required: true,
    completionEnabled: true,
    reviewerEnabled: true,
    defaultValue: 'unchecked',
    options: RESULT_OPTIONS,
  }),
  simpleField('event-risk-material-rights', '使用素材の権利', 'result', {
    required: true,
    completionEnabled: true,
    reviewerEnabled: true,
    defaultValue: 'unchecked',
    options: RESULT_OPTIONS,
  }),
  simpleField('event-risk-privacy', '個人情報の取扱い', 'result', {
    required: true,
    completionEnabled: true,
    reviewerEnabled: true,
    defaultValue: 'unchecked',
    options: RESULT_OPTIONS,
  }),
]);

const retrospectiveFields = orderedFields([
  simpleField('event-retrospective-survey-created', 'アンケート作成', 'checkbox', {
    required: true,
    completionEnabled: true,
    assigneeEnabled: true,
    dueDateEnabled: true,
    defaultValue: false,
  }),
  simpleField('event-retrospective-survey-url', 'アンケートURL', 'url', {
    completionEnabled: true,
    externalToolHint: 'Google Forms等の回答フォームURLを保存する。',
  }),
  simpleField('event-retrospective-staff-review', 'スタッフ反省会', 'datetime', {
    required: true,
    completionEnabled: true,
    assigneeEnabled: true,
    dueDateEnabled: true,
  }),
  simpleField('event-retrospective-participant-count', '参加者数', 'number', {
    completionEnabled: true,
  }),
  simpleField('event-retrospective-social-reaction', 'SNS反応', 'richList', {
    completionEnabled: true,
    defaultValue: [],
    richListColumns: [
      { id: 'metric', label: '指標', inputType: 'shortText', required: true },
      { id: 'value', label: '値', inputType: 'number', required: true },
      { id: 'url', label: '参照URL', inputType: 'url', required: false },
    ],
  }),
  simpleField('event-retrospective-positive', '良かった点', 'longText', {
    required: true,
    completionEnabled: true,
  }),
  simpleField('event-retrospective-issues', '課題', 'longText', {
    required: true,
    completionEnabled: true,
  }),
  simpleField('event-retrospective-next-improvements', '次回改善', 'richList', {
    required: true,
    completionEnabled: true,
    assigneeEnabled: true,
    dueDateEnabled: true,
    defaultValue: [],
    richListColumns: [
      { id: 'improvement', label: '改善内容', inputType: 'shortText', required: true },
      { id: 'owner', label: '担当候補', inputType: 'userSelect', required: false },
      { id: 'dueDate', label: '期限候補', inputType: 'date', required: false },
    ],
  }),
  simpleField('event-retrospective-generate-tasks', '改善タスク生成', 'checkbox', {
    completionEnabled: true,
    defaultValue: false,
  }),
]);

const generatedTasks: GeneratedTaskDefinition[] = [
  {
    id: 'event-task-confirm-plan',
    title: '企画内容と完了条件を確定する',
    managementType: 'task',
    phaseId: 'approval',
    status: 'todo',
    required: true,
    assigneeFromFieldId: 'event-basic-owner',
    sortOrder: 1,
  },
  {
    id: 'event-task-confirm-schedule',
    title: '開催日時・会場・定員を確定する',
    managementType: 'task',
    phaseId: 'planning',
    status: 'todo',
    required: true,
    assigneeFromFieldId: 'event-basic-owner',
    dueDateFromFieldId: 'event-plan-datetime',
    sortOrder: 2,
  },
  {
    id: 'event-task-list-deliverables',
    title: '必要制作物を洗い出す',
    managementType: 'task',
    phaseId: 'preparation',
    status: 'todo',
    required: true,
    assigneeFromFieldId: 'event-basic-owner',
    sortOrder: 3,
  },
  {
    id: 'event-task-plan-operations',
    title: 'タイムスケジュールとスタッフ配置を確定する',
    managementType: 'task',
    phaseId: 'preparation',
    status: 'todo',
    required: true,
    assigneeFromFieldId: 'event-basic-owner',
    sortOrder: 4,
  },
  {
    id: 'event-task-rehearsal',
    title: 'リハーサルを実施する',
    managementType: 'task',
    phaseId: 'qa',
    status: 'todo',
    required: true,
    assigneeFromFieldId: 'event-basic-owner',
    dueDateFromFieldId: 'event-operations-rehearsal',
    sortOrder: 5,
  },
  {
    id: 'event-task-rights-review',
    title: '撮影・掲載・使用素材の権利を確認する',
    managementType: 'task',
    phaseId: 'qa',
    status: 'todo',
    required: true,
    assigneeFromFieldId: 'event-basic-owner',
    sortOrder: 6,
  },
  {
    id: 'event-task-prepare-survey',
    title: '参加者アンケートを準備する',
    managementType: 'task',
    phaseId: 'preparation',
    status: 'todo',
    required: false,
    assigneeFromFieldId: 'event-basic-owner',
    sortOrder: 7,
  },
  {
    id: 'event-task-retrospective',
    title: 'スタッフ反省会を実施し改善事項を整理する',
    managementType: 'task',
    phaseId: 'retrospective',
    status: 'todo',
    required: true,
    assigneeFromFieldId: 'event-basic-owner',
    dueDateFromFieldId: 'event-retrospective-staff-review',
    sortOrder: 8,
  },
];

export const EVENT_PROJECT_TEMPLATE: ProjectTemplate = {
  id: 'TPL-EVENT-001',
  name: 'イベント企画プロジェクト',
  description: 'イベントの企画設計、開催計画、当日運営、リスク確認、振り返りを一貫して管理する。',
  majorCategoryId: 'CAT-PLN',
  middleCategoryId: 'CAT-PLN-EVENT',
  version: 1,
  active: true,
  defaultVisibility: 'staff',
  phases: phaseSetToTemplatePhases(EVENT_PHASE_SET, 'planning'),
  sections: [
    {
      id: 'event-section-basic',
      name: '基本情報',
      description: '企画の目的、対象、完了条件を定義する。',
      sortOrder: 1,
      fields: basicFields,
    },
    {
      id: 'event-section-schedule',
      name: '開催計画',
      description: '日時、会場、定員、スタッフ、予算を決める。',
      sortOrder: 2,
      fields: scheduleFields,
    },
    {
      id: 'event-section-content',
      name: 'コンテンツ設計',
      description: '実施内容と参加者体験、必要制作物を設計する。',
      sortOrder: 3,
      fields: contentFields,
    },
    {
      id: 'event-section-operations',
      name: '当日運営設計',
      description: 'タイムスケジュール、配置、案内、緊急対応を決める。',
      sortOrder: 4,
      fields: operationsFields,
    },
    {
      id: 'event-section-risk',
      name: 'リスク・権利確認',
      description: '代替手段、障害対応、許諾、個人情報を確認する。',
      sortOrder: 5,
      fields: riskFields,
    },
    {
      id: 'event-section-retrospective',
      name: '振り返り',
      description: '実績、反応、課題、次回改善を記録する。',
      sortOrder: 6,
      fields: retrospectiveFields,
    },
  ],
  generatedTasks,
};

export const PROJECT_TEMPLATES: readonly ProjectTemplate[] = Object.freeze([
  EVENT_PROJECT_TEMPLATE,
]);

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createProjectTemplateSnapshot(
  template: ProjectTemplate,
  capturedAt = new Date().toISOString(),
): ProjectTemplateSnapshot {
  return {
    templateId: template.id,
    templateVersion: template.version,
    templateName: template.name,
    capturedAt,
    phases: cloneJson(template.phases),
    sections: cloneJson(template.sections),
    generatedTasks: cloneJson(template.generatedTasks),
  };
}

export function createInitialTemplateValues(
  template: ProjectTemplate | ProjectTemplateSnapshot,
): TemplateValueMap {
  return Object.fromEntries(
    template.sections.flatMap(section =>
      section.fields.map(field => [
        field.id,
        {
          value: cloneJson(field.defaultValue ?? null),
          completed: false,
          ...(field.assigneeEnabled ? { assigneeUids: [] } : {}),
          ...(field.reviewerEnabled ? { reviewerUids: [] } : {}),
        },
      ]),
    ),
  );
}

export interface InstantiatedProjectTemplate {
  initialPhaseId: string;
  snapshot: ProjectTemplateSnapshot;
  templateValues: TemplateValueMap;
  generatedTaskDefinitions: GeneratedTaskDefinition[];
}

/**
 * Produces a per-project snapshot. Persist this result on the project; never
 * resolve an existing project back through the mutable template master.
 */
export function instantiateProjectTemplate(
  template: ProjectTemplate,
  capturedAt = new Date().toISOString(),
): InstantiatedProjectTemplate {
  const snapshot = createProjectTemplateSnapshot(template, capturedAt);
  const initialPhaseId =
    snapshot.phases.find(item => item.initial)?.id ?? snapshot.phases[0]?.id ?? '';
  return {
    initialPhaseId,
    snapshot,
    templateValues: createInitialTemplateValues(snapshot),
    generatedTaskDefinitions: cloneJson(snapshot.generatedTasks),
  };
}

export function validateProjectTemplate(template: ProjectTemplate): string[] {
  const issues: string[] = [];
  const phaseIds = new Set<string>();
  const fieldIds = new Set<string>();
  const generatedTaskIds = new Set<string>();

  if (template.phases.filter(item => item.initial).length !== 1) {
    issues.push(`${template.id}: 初期フェーズは1件必要です。`);
  }

  for (const item of template.phases) {
    if (phaseIds.has(item.id)) issues.push(`${item.id}: フェーズIDが重複しています。`);
    phaseIds.add(item.id);
  }

  for (const section of template.sections) {
    if (/[.#$\[\]/]/.test(section.id)) {
      issues.push(`${section.id}: Firebaseで使えない文字を含みます。`);
    }
    for (const field of section.fields) {
      if (fieldIds.has(field.id)) issues.push(`${field.id}: 項目IDが重複しています。`);
      fieldIds.add(field.id);
      if (/[.#$\[\]/]/.test(field.id)) {
        issues.push(`${field.id}: Firebaseで使えない文字を含みます。`);
      }
      if (field.inputType === 'richList' && !field.richListColumns?.length) {
        issues.push(`${field.id}: richListには列定義が必要です。`);
      }
    }
  }

  for (const task of template.generatedTasks) {
    if (generatedTaskIds.has(task.id)) {
      issues.push(`${task.id}: 初期タスクIDが重複しています。`);
    }
    generatedTaskIds.add(task.id);
    if (task.phaseId && !phaseIds.has(task.phaseId)) {
      issues.push(`${task.id}: 未定義のフェーズを参照しています。`);
    }
    for (const fieldId of [
      task.assigneeFromFieldId,
      task.reviewerFromFieldId,
      task.dueDateFromFieldId,
    ]) {
      if (fieldId && !fieldIds.has(fieldId)) {
        issues.push(`${task.id}: 未定義の項目 ${fieldId} を参照しています。`);
      }
    }
  }

  return issues;
}
