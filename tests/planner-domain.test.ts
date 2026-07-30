import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CATEGORY_MIGRATION_VERSION,
  EVENT_PROJECT_TEMPLATE,
  INITIAL_CATEGORY_MASTER,
  SURFACE_VIEW_ACCESS,
  buildCategoryHierarchyTemplate,
  calculateProjectProgress,
  getCategoryChildren,
  instantiateProjectTemplate,
  isCategorySelectionValid,
  isViewAllowedOnSurface,
  migrateLegacyPlannerState,
  reconcileCategorySelection,
  validateCategoryMaster,
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

test('カテゴリ階層テンプレートは選択した深さで有効なカテゴリマスタを作る', () => {
  const simple = buildCategoryHierarchyTemplate('simple', INITIAL_CATEGORY_MASTER);
  const normal = buildCategoryHierarchyTemplate('normal', INITIAL_CATEGORY_MASTER);
  const detailed = buildCategoryHierarchyTemplate('detailed', INITIAL_CATEGORY_MASTER);

  assert.ok(simple.every(category => category.level === 1));
  assert.ok(normal.some(category => category.level === 2));
  assert.ok(normal.every(category => category.level <= 2));
  assert.ok(detailed.some(category => category.level === 3));
  for (const categories of [simple, normal, detailed]) {
    assert.deepEqual(validateCategoryMaster(categories), []);
  }
});

test('浅いカテゴリテンプレートでも使用中の小分類と祖先を保持する', () => {
  const retained = buildCategoryHierarchyTemplate(
    'simple',
    INITIAL_CATEGORY_MASTER,
    ['CAT-PLN-EVENT-NEW'],
  );
  const byId = new Map(retained.map(category => [category.id, category]));

  assert.equal(byId.get('CAT-PLN-EVENT-NEW')?.parentId, 'CAT-PLN-EVENT');
  assert.equal(byId.get('CAT-PLN-EVENT')?.parentId, 'CAT-PLN');
  assert.equal(byId.get('CAT-PLN')?.parentId, null);
  assert.equal(byId.has('CAT-HR-RECRUIT'), false);
  assert.deepEqual(validateCategoryMaster(retained), []);
});

test('不正なカテゴリ階層テンプレート値を実行時に拒否する', () => {
  for (const template of ['unknown', 'toString', '__proto__']) {
    assert.throws(
      () => buildCategoryHierarchyTemplate(template as never, INITIAL_CATEGORY_MASTER),
      /未対応のカテゴリ階層テンプレート/,
    );
  }
});

test('個人・イベント管理・総合管理ページのメニュー境界を分離する', () => {
  const expectedAccess = {
    app: [
      'home',
      'mypage',
      'calendar',
      'triage',
      'future',
      'yearly',
      'weekly',
      'daily',
      'tasksAssigned',
      'tasksOperations',
      'tasksStaff',
      'tasksCast',
      'events',
      'projects',
      'meetings',
      'schedulePolls',
      'notes',
      'settings',
    ],
    owner: [
      'adminEvent',
      'adminAudit',
      'adminInvites',
      'adminApplications',
      'adminLinks',
      'adminRoles',
      'permissions',
      'settings',
      'backup',
    ],
    global: [
      'globalEvents',
      'globalEventList',
      'globalEventDetails',
      'globalInvites',
      'globalApplications',
      'globalAudit',
      'globalTrash',
    ],
  } as const;

  assert.deepEqual(SURFACE_VIEW_ACCESS, expectedAccess);
  for (const views of Object.values(SURFACE_VIEW_ACCESS)) {
    assert.equal(new Set(views).size, views.length);
  }

  for (const view of ['home', 'mypage', 'settings']) {
    assert.equal(isViewAllowedOnSurface('app', view), true);
  }
  for (const view of SURFACE_VIEW_ACCESS.owner.filter(view => view !== 'settings')) {
    assert.equal(isViewAllowedOnSurface('app', view), false);
  }
  for (const view of SURFACE_VIEW_ACCESS.global) {
    assert.equal(isViewAllowedOnSurface('app', view), false);
    assert.equal(isViewAllowedOnSurface('owner', view), false);
  }

  for (const view of ['adminEvent', 'adminAudit', 'settings']) {
    assert.equal(isViewAllowedOnSurface('owner', view), true);
  }
  for (const view of ['globalEventList', 'globalAudit', 'globalTrash']) {
    assert.equal(isViewAllowedOnSurface('global', view), true);
  }
  for (const surface of ['app', 'owner', 'global'] as const) {
    assert.equal(isViewAllowedOnSurface(surface, 'unknownView'), false);
  }
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
