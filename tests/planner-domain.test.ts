import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CATEGORY_MIGRATION_VERSION,
  EVENT_PROJECT_TEMPLATE,
  INITIAL_CATEGORY_MASTER,
  calculateProjectProgress,
  getCategoryChildren,
  instantiateProjectTemplate,
  isCategorySelectionValid,
  migrateLegacyPlannerState,
  reconcileCategorySelection,
  validatePlannerDomain,
} from '../Arasaki_Staff_Planner_v0_8_Deploy/src/domain/planner-v1/index.ts';

test('初期カテゴリは大・中・小の正しい親子関係を持つ', () => {
  assert.equal(validatePlannerDomain().length, 0);
  assert.equal(INITIAL_CATEGORY_MASTER.filter(item => item.level === 1).length, 8);

  const planningMiddle = getCategoryChildren('CAT-PLN');
  assert.deepEqual(
    planningMiddle.map(item => item.id),
    [
      'CAT-PLN-EVENT',
      'CAT-PLN-CONTENT',
      'CAT-PLN-COLLAB',
      'CAT-PLN-CAMPAIGN',
      'CAT-PLN-OPS-IMPROVEMENT',
      'CAT-PLN-OTHER',
    ],
  );
  assert.ok(getCategoryChildren('CAT-PLN-EVENT').every(item => item.parentId === 'CAT-PLN-EVENT'));
});

test('親カテゴリ変更時は不正な中・小カテゴリを解除する', () => {
  const reconciled = reconcileCategorySelection({
    majorCategoryId: 'CAT-HR',
    middleCategoryId: 'CAT-PLN-EVENT',
    smallCategoryId: 'CAT-PLN-EVENT-NEW',
  });
  assert.deepEqual(reconciled, { majorCategoryId: 'CAT-HR' });
  assert.equal(isCategorySelectionValid({ majorCategoryId: 'CAT-HR' }), true);
});

test('旧カテゴリ移行は原値を保持し、再実行しても同じ結果になる', () => {
  const source = {
    tasks: [
      { id: 'world', title: '確認', category: 'ワールド制作', workspaceId: 'arasaki-shipyard' },
      { id: 'unknown', title: '不明', category: '旧独自カテゴリ', workspaceId: 'arasaki-shipyard' },
      { id: 'personal', title: '私用', category: 'PRIVATE', workspaceId: 'personal' },
    ],
    projects: [],
    notes: [],
  };
  const first = migrateLegacyPlannerState(source);
  const second = migrateLegacyPlannerState(first.state);

  assert.equal(first.state.categoryMigrationVersion, CATEGORY_MIGRATION_VERSION);
  assert.equal(first.state.tasks[0].majorCategoryId, 'CAT-PRD');
  assert.equal(first.state.tasks[0].middleCategoryId, 'CAT-PRD-WORLD');
  assert.equal(first.state.tasks[0].legacyCategory, 'ワールド制作');
  assert.equal(first.state.tasks[1].classificationStatus, 'needs-classification');
  assert.equal(first.state.tasks[2].majorCategoryId, undefined);
  assert.deepEqual(second.state, first.state);
  assert.equal(second.report.changed, 0);
});

test('イベントテンプレートはプロジェクトへ独立したスナップショットを作る', () => {
  const instance = instantiateProjectTemplate(EVENT_PROJECT_TEMPLATE, '2026-07-30T00:00:00.000Z');
  const originalName = instance.snapshot.sections[0].name;
  instance.snapshot.sections[0].name = 'プロジェクト固有の名称';

  assert.equal(EVENT_PROJECT_TEMPLATE.id, 'TPL-EVENT-001');
  assert.equal(EVENT_PROJECT_TEMPLATE.sections.length, 6);
  assert.equal(instance.snapshot.templateVersion, 1);
  assert.equal(originalName, '基本情報');
  assert.equal(EVENT_PROJECT_TEMPLATE.sections[0].name, '基本情報');
  assert.equal(Object.keys(instance.templateValues).length, 51);
  assert.equal(instance.generatedTaskDefinitions.length, 8);
});

test('進捗率は必須テンプレート項目・有効タスク・必須品質確認から算出する', () => {
  const instance = instantiateProjectTemplate(EVENT_PROJECT_TEMPLATE);
  const requiredField = EVENT_PROJECT_TEMPLATE.sections.flatMap(section => section.fields)
    .find(field => field.required && field.completionEnabled);
  assert.ok(requiredField);
  instance.templateValues[requiredField.id].completed = true;

  const result = calculateProjectProgress({
    projectId: 'project-1',
    template: instance.snapshot,
    templateValues: instance.templateValues,
    tasks: [
      { id: 'done', projectId: 'project-1', status: 'done' },
      { id: 'open', projectId: 'project-1', status: 'todo' },
      { id: 'archived', projectId: 'project-1', status: 'archived' },
    ],
    qualityChecks: [
      { id: 'qa-pass', projectId: 'project-1', label: '確認', required: true, result: 'passed' },
      { id: 'qa-na', projectId: 'project-1', label: '対象外', required: true, result: 'notApplicable' },
    ],
  });

  assert.ok(result.total > 3);
  assert.equal(result.tasks.total, 2);
  assert.equal(result.tasks.completed, 1);
  assert.equal(result.qualityChecks.total, 1);
  assert.equal(result.qualityChecks.completed, 1);
  assert.equal(result.excludedIds.includes('task:archived'), true);
});
