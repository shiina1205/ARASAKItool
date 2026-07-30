import type {
  ProjectPhaseDefinition,
  ProjectPhaseSet,
  TemplatePhase,
} from './types.ts';

function phase(
  phaseSetId: string,
  id: string,
  name: string,
  description: string,
  sortOrder: number,
  flags: Pick<ProjectPhaseDefinition, 'terminal' | 'archived'> = {},
): ProjectPhaseDefinition {
  return { id, phaseSetId, name, description, sortOrder, ...flags };
}

export const EVENT_PHASE_SET: ProjectPhaseSet = {
  id: 'PHASE-SET-EVENT',
  name: '企画・イベント標準フェーズ',
  description: 'アイデア登録から実施、振り返り、保管までの標準進行。',
  active: true,
  phases: [
    phase('PHASE-SET-EVENT', 'idea', 'アイデア', '思いつき・候補を記録する。', 1),
    phase('PHASE-SET-EVENT', 'review', '企画化検討', '実施可否を判断する。', 2),
    phase('PHASE-SET-EVENT', 'discovery', '洗い出し', '必要事項を列挙する。', 3),
    phase('PHASE-SET-EVENT', 'deep-dive', '深掘り', '内容・条件を具体化する。', 4),
    phase('PHASE-SET-EVENT', 'approval', '企画承認', '実施方針と責任者を確定する。', 5),
    phase('PHASE-SET-EVENT', 'planning', '開催計画', '日時、会場、定員、予算を決定する。', 6),
    phase('PHASE-SET-EVENT', 'preparation', '準備', '制作・広報・スタッフ調整を進める。', 7),
    phase('PHASE-SET-EVENT', 'qa', '最終確認', '品質確認とリハーサルを行う。', 8),
    phase('PHASE-SET-EVENT', 'execution', '実施', 'イベント当日の運営を行う。', 9),
    phase('PHASE-SET-EVENT', 'retrospective', '振り返り', '集計・反省会・改善整理を行う。', 10),
    phase('PHASE-SET-EVENT', 'completed', '完了', '完了条件を満たした状態。', 11, {
      terminal: true,
    }),
    phase('PHASE-SET-EVENT', 'archived', 'アーカイブ', '参照用に保管した状態。', 12, {
      terminal: true,
      archived: true,
    }),
  ],
};

export const PRODUCTION_PHASE_SET: ProjectPhaseSet = {
  id: 'PHASE-SET-PRODUCTION',
  name: '制作標準フェーズ',
  description: '要件確認から納品・公開準備までの制作進行。',
  active: true,
  phases: [
    phase('PHASE-SET-PRODUCTION', 'production-requirements', '要件確認', '目的、仕様、完了条件を確認する。', 1),
    phase('PHASE-SET-PRODUCTION', 'production-research', '資料収集', '参考資料と必要素材を集める。', 2),
    phase('PHASE-SET-PRODUCTION', 'production-design', '設計', '構成・仕様・制作方法を決める。', 3),
    phase('PHASE-SET-PRODUCTION', 'production-build', '制作', '成果物を制作する。', 4),
    phase('PHASE-SET-PRODUCTION', 'production-internal-review', '内部確認', 'チーム内で内容を確認する。', 5),
    phase('PHASE-SET-PRODUCTION', 'production-revision', '修正', '指摘事項を修正する。', 6),
    phase('PHASE-SET-PRODUCTION', 'production-optimization', '最適化', '性能・容量・表現を最適化する。', 7),
    phase('PHASE-SET-PRODUCTION', 'production-qa', '品質確認', '要件、動作、権利を確認する。', 8),
    phase('PHASE-SET-PRODUCTION', 'production-release', '納品・公開準備', '納品物と公開条件を整える。', 9),
    phase('PHASE-SET-PRODUCTION', 'production-completed', '完了', '納品・公開準備まで完了した状態。', 10, {
      terminal: true,
    }),
  ],
};

export const RECRUITMENT_PHASE_SET: ProjectPhaseSet = {
  id: 'PHASE-SET-RECRUITMENT',
  name: '採用標準フェーズ',
  description: '採用計画から登録・配属、新人対応までの進行。',
  active: true,
  phases: [
    phase('PHASE-SET-RECRUITMENT', 'recruitment-planning', '採用計画', '募集目的、職種、人数を決める。', 1),
    phase('PHASE-SET-RECRUITMENT', 'recruitment-preparation', '募集準備', '募集要項、画像、応募方法を用意する。', 2),
    phase('PHASE-SET-RECRUITMENT', 'recruitment-open', '募集開始', '募集を公開する。', 3),
    phase('PHASE-SET-RECRUITMENT', 'recruitment-applications', '応募受付', '応募を受け付け、応募者を管理する。', 4),
    phase('PHASE-SET-RECRUITMENT', 'recruitment-screening', '選考', '書類確認、面談、合否判断を行う。', 5),
    phase('PHASE-SET-RECRUITMENT', 'recruitment-notification', '結果連絡', '応募者へ結果を連絡する。', 6),
    phase('PHASE-SET-RECRUITMENT', 'recruitment-placement', '登録・配属', 'スタッフ登録、所属、権限を設定する。', 7),
    phase('PHASE-SET-RECRUITMENT', 'recruitment-onboarding', '新人対応', '講習、案内、研修確認を行う。', 8),
    phase('PHASE-SET-RECRUITMENT', 'recruitment-completed', '完了', '採用と初期対応が完了した状態。', 9, {
      terminal: true,
    }),
  ],
};

export const PROJECT_PHASE_SETS: readonly ProjectPhaseSet[] = Object.freeze([
  EVENT_PHASE_SET,
  PRODUCTION_PHASE_SET,
  RECRUITMENT_PHASE_SET,
]);

export const PHASE_INDEX: ReadonlyMap<string, ProjectPhaseDefinition> = new Map(
  PROJECT_PHASE_SETS.flatMap(phaseSet => phaseSet.phases).map(item => [item.id, item]),
);

export function phaseSetToTemplatePhases(
  phaseSet: ProjectPhaseSet,
  initialPhaseId: string,
): TemplatePhase[] {
  return phaseSet.phases.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    sortOrder: item.sortOrder,
    ...(item.id === initialPhaseId ? { initial: true } : {}),
    ...(item.terminal ? { terminal: true } : {}),
  }));
}

export function validatePhaseSets(
  phaseSets: readonly ProjectPhaseSet[] = PROJECT_PHASE_SETS,
): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();

  for (const phaseSet of phaseSets) {
    const initialOrder = phaseSet.phases.map(item => item.sortOrder);
    if (new Set(initialOrder).size !== initialOrder.length) {
      issues.push(`${phaseSet.id}: sortOrderが重複しています。`);
    }
    for (const item of phaseSet.phases) {
      if (ids.has(item.id)) issues.push(`${item.id}: フェーズIDが重複しています。`);
      ids.add(item.id);
      if (item.phaseSetId !== phaseSet.id) {
        issues.push(`${item.id}: phaseSetIdが一致しません。`);
      }
    }
  }

  return issues;
}
