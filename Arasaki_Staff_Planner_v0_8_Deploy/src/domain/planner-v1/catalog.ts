import type {
  Category,
  CategoryLevel,
  CategorySelection,
  ManagementType,
  QualityResult,
  RelatedToolType,
  TemplateInputType,
  Visibility,
} from './types.ts';

export const MANAGEMENT_TYPES = [
  { value: 'idea', label: 'アイデア' },
  { value: 'project', label: 'プロジェクト' },
  { value: 'task', label: 'タスク' },
  { value: 'meeting', label: '会議' },
  { value: 'request', label: '依頼・案件' },
  { value: 'recurring', label: '定期業務' },
  { value: 'record', label: '記録・台帳' },
] as const satisfies readonly { value: ManagementType; label: string }[];

export const VISIBILITIES = [
  { value: 'owner', label: 'オーナーのみ' },
  { value: 'operations', label: 'オーナー・運営' },
  { value: 'staff', label: 'オーナー・運営・スタッフ' },
  { value: 'cast', label: '全登録ユーザー' },
] as const satisfies readonly { value: Visibility; label: string }[];

export const TEMPLATE_INPUT_TYPES = [
  { value: 'shortText', label: '短文' },
  { value: 'longText', label: '長文' },
  { value: 'number', label: '数値' },
  { value: 'currency', label: '金額' },
  { value: 'date', label: '日付' },
  { value: 'datetime', label: '日時' },
  { value: 'datetimeRange', label: '開始・終了日時' },
  { value: 'checkbox', label: '完了チェック' },
  { value: 'singleSelect', label: '単一選択' },
  { value: 'multiSelect', label: '複数選択' },
  { value: 'userSelect', label: '担当者' },
  { value: 'userChecklist', label: '対象者一覧＋チェック' },
  { value: 'url', label: 'URL' },
  { value: 'fileLink', label: 'ファイル・Driveリンク' },
  { value: 'result', label: '未確認・合格・要修正・対象外' },
  { value: 'externalTool', label: '外部ツール情報' },
  { value: 'richList', label: '複数行の構造化リスト' },
] as const satisfies readonly { value: TemplateInputType; label: string }[];

export const QUALITY_RESULTS = [
  { value: 'unchecked', label: '未確認' },
  { value: 'passed', label: '合格' },
  { value: 'needsRevision', label: '要修正' },
  { value: 'notApplicable', label: '対象外' },
] as const satisfies readonly { value: QualityResult; label: string }[];

export const RELATED_TOOL_TYPES = [
  { value: 'discord', label: 'Discord' },
  { value: 'googleDrive', label: 'Google Drive' },
  { value: 'googleDocs', label: 'Google Docs' },
  { value: 'googleSheets', label: 'Google Sheets' },
  { value: 'googleForms', label: 'Google Forms' },
  { value: 'chouseisan', label: '調整さん' },
  { value: 'github', label: 'GitHub' },
  { value: 'vrchat', label: 'VRChat' },
  { value: 'x', label: 'X' },
  { value: 'other', label: 'その他' },
] as const satisfies readonly { value: RelatedToolType; label: string }[];

function major(
  id: string,
  name: string,
  description: string,
  sortOrder: number,
  icon: string,
  color: string,
  system = false,
): Category {
  return {
    id,
    level: 1,
    parentId: null,
    name,
    description,
    icon,
    color,
    sortOrder,
    active: true,
    ...(system ? { system: true } : {}),
  };
}

function middle(
  id: string,
  parentId: string,
  name: string,
  sortOrder: number,
  active = true,
): Category {
  return { id, level: 2, parentId, name, sortOrder, active };
}

function smallCategories(
  parentId: string,
  entries: readonly (readonly [id: string, name: string])[],
  active = true,
): Category[] {
  return entries.map(([id, name], index) => ({
    id,
    level: 3,
    parentId,
    name,
    sortOrder: index + 1,
    active,
  }));
}

const majorCategories: Category[] = [
  major('CAT-PLN', '企画', 'イベント・コンテンツ・コラボ等の企画', 1, '🧭', '#b56b45'),
  major('CAT-HR', '人事', '採用、配属、講習、面談、退任', 2, '♙', '#8c6cb2'),
  major('CAT-GA', '総務', '会議、文書、連絡、名簿、素材、経費、外部対応', 3, '▤', '#5f7e96'),
  major('CAT-IT', '情報システム', 'アカウント、開発、不具合、データ、セキュリティ', 4, '⌘', '#3f7f89'),
  major('CAT-PRD', '制作', 'ワールド、アバター、衣装、画像、動画等の制作', 5, '◆', '#a55d73'),
  major('CAT-PR', '広報', '告知、投稿、紹介、コラボ広報、効果測定', 6, '📣', '#b48832'),
  major('CAT-QA', '品質確認', '仕様・制作物・運営・権利の確認', 7, '🔎', '#557a56'),
  major('CAT-UNC', '未分類', '移行直後または判断保留の一時分類', 99, '？', '#737373', true),
];

const planningMiddle: Category[] = [
  middle('CAT-PLN-EVENT', 'CAT-PLN', 'イベント企画', 1),
  middle('CAT-PLN-CONTENT', 'CAT-PLN', 'コンテンツ企画', 2),
  middle('CAT-PLN-COLLAB', 'CAT-PLN', 'コラボ企画', 3),
  middle('CAT-PLN-CAMPAIGN', 'CAT-PLN', 'キャンペーン企画', 4),
  middle('CAT-PLN-OPS-IMPROVEMENT', 'CAT-PLN', '運用改善企画', 5),
  middle('CAT-PLN-OTHER', 'CAT-PLN', 'その他企画', 6),
];

const planningSmall: Category[] = [
  ...smallCategories('CAT-PLN-EVENT', [
    ['CAT-PLN-EVENT-NEW', '新規イベント'],
    ['CAT-PLN-EVENT-RECURRING', '定期イベント'],
    ['CAT-PLN-EVENT-SPECIAL', '特別開催'],
    ['CAT-PLN-EVENT-GATHERING', '集会'],
    ['CAT-PLN-EVENT-AWARD', '発表・表彰'],
    ['CAT-PLN-EVENT-EXHIBITION', '展示'],
    ['CAT-PLN-EVENT-PARTICIPATORY', '参加型企画'],
  ]),
  ...smallCategories('CAT-PLN-CONTENT', [
    ['CAT-PLN-CONTENT-STAGE', 'ステージ'],
    ['CAT-PLN-CONTENT-RP', 'RP'],
    ['CAT-PLN-CONTENT-PHOTO', '撮影'],
    ['CAT-PLN-CONTENT-GAME', 'ゲーム'],
    ['CAT-PLN-CONTENT-EXHIBITION', '展示'],
    ['CAT-PLN-CONTENT-OTHER', 'その他'],
  ]),
];

const hrMiddle: Category[] = [
  middle('CAT-HR-RECRUIT', 'CAT-HR', '採用', 1),
  middle('CAT-HR-ASSIGN', 'CAT-HR', '登録・配属', 2),
  middle('CAT-HR-ONBOARD', 'CAT-HR', '新人対応', 3),
  middle('CAT-HR-SHIFT', 'CAT-HR', 'シフト・稼働', 4),
  middle('CAT-HR-FOLLOWUP', 'CAT-HR', '面談・フォロー', 5),
  middle('CAT-HR-OFFBOARD', 'CAT-HR', '休止・退任', 6),
];

const hrSmall: Category[] = [
  ...smallCategories('CAT-HR-RECRUIT', [
    ['CAT-HR-RECRUIT-REQUIREMENTS', '募集要項'],
    ['CAT-HR-RECRUIT-PUBLICITY', '募集告知'],
    ['CAT-HR-RECRUIT-APPLICATION', '応募受付'],
    ['CAT-HR-RECRUIT-APPLICANT-MGMT', '応募者管理'],
    ['CAT-HR-RECRUIT-DOCUMENT-REVIEW', '書類確認'],
    ['CAT-HR-RECRUIT-INTERVIEW-SCHEDULE', '面談調整'],
    ['CAT-HR-RECRUIT-INTERVIEW', '採用面談'],
    ['CAT-HR-RECRUIT-DECISION', '合否判定'],
    ['CAT-HR-RECRUIT-RESULT', '結果連絡'],
  ]),
  ...smallCategories('CAT-HR-ASSIGN', [
    ['CAT-HR-ASSIGN-STAFF-REGISTRATION', 'スタッフ登録'],
    ['CAT-HR-ASSIGN-TEAM', '所属班設定'],
    ['CAT-HR-ASSIGN-RESPONSIBILITY', '担当決定'],
    ['CAT-HR-ASSIGN-PERMISSION', '権限申請'],
  ]),
  ...smallCategories('CAT-HR-ONBOARD', [
    ['CAT-HR-ONBOARD-TRAINING', '新人講習'],
    ['CAT-HR-ONBOARD-MANUAL', 'マニュアル案内'],
    ['CAT-HR-ONBOARD-ASSIGNMENT', '研修課題'],
    ['CAT-HR-ONBOARD-REVIEW', '研修確認'],
  ]),
  ...smallCategories('CAT-HR-SHIFT', [
    ['CAT-HR-SHIFT-ATTENDANCE', '出欠確認'],
    ['CAT-HR-SHIFT-AVAILABILITY', '希望回収'],
    ['CAT-HR-SHIFT-CREATE', 'シフト作成'],
    ['CAT-HR-SHIFT-VACANCY', '欠員対応'],
    ['CAT-HR-SHIFT-SUBSTITUTE', '代理調整'],
  ]),
  ...smallCategories('CAT-HR-FOLLOWUP', [
    ['CAT-HR-FOLLOWUP-REGULAR-INTERVIEW', '定期面談'],
    ['CAT-HR-FOLLOWUP-ACTIVITY', '活動状況確認'],
    ['CAT-HR-FOLLOWUP-CONSULTATION', '困りごと相談'],
    ['CAT-HR-FOLLOWUP-FEEDBACK', 'フィードバック'],
    ['CAT-HR-FOLLOWUP-PAUSE', '休止確認'],
  ]),
  ...smallCategories('CAT-HR-OFFBOARD', [
    ['CAT-HR-OFFBOARD-PAUSE', '休止手続き'],
    ['CAT-HR-OFFBOARD-DEPARTURE', '退任確認'],
    ['CAT-HR-OFFBOARD-HANDOVER', '担当引継ぎ'],
    ['CAT-HR-OFFBOARD-ACCESS-REVOKE', '権限解除'],
    ['CAT-HR-OFFBOARD-ROSTER', '名簿更新'],
  ]),
];

const generalAffairsMiddle: Category[] = [
  middle('CAT-GA-MEETING', 'CAT-GA', '会議管理', 1),
  middle('CAT-GA-DOCUMENT', 'CAT-GA', '文書管理', 2),
  middle('CAT-GA-COMMS', 'CAT-GA', '連絡・共有', 3),
  middle('CAT-GA-DIRECTORY', 'CAT-GA', '名簿管理', 4),
  middle('CAT-GA-ASSET', 'CAT-GA', '素材管理', 5),
  middle('CAT-GA-EXPENSE', 'CAT-GA', '経費・購入', 6),
  middle('CAT-GA-EXTERNAL', 'CAT-GA', '外部対応', 7),
  // 仕様23章の未決定候補。IDを予約し、正式採用までは新規候補に出さない。
  middle('CAT-GA-LEGAL', 'CAT-GA', '契約・許諾', 8, false),
];

const generalAffairsSmall: Category[] = [
  ...smallCategories('CAT-GA-MEETING', [
    ['CAT-GA-MEETING-SCHEDULE', '日程調整'],
    ['CAT-GA-MEETING-TOPICS', '議題募集'],
    ['CAT-GA-MEETING-AGENDA', 'アジェンダ'],
    ['CAT-GA-MEETING-MINUTES', '議事録'],
    ['CAT-GA-MEETING-DECISIONS', '決定事項共有'],
  ]),
  ...smallCategories('CAT-GA-DOCUMENT', [
    ['CAT-GA-DOCUMENT-RULES', '規約'],
    ['CAT-GA-DOCUMENT-GUIDELINE', 'ガイドライン'],
    ['CAT-GA-DOCUMENT-MANUAL', 'マニュアル'],
    ['CAT-GA-DOCUMENT-TEMPLATE', 'テンプレート'],
    ['CAT-GA-DOCUMENT-CHANGELOG', '変更履歴'],
  ]),
  ...smallCategories('CAT-GA-COMMS', [
    ['CAT-GA-COMMS-ALL', '全体連絡'],
    ['CAT-GA-COMMS-OPERATIONS', '運営連絡'],
    ['CAT-GA-COMMS-STAFF', 'スタッフ連絡'],
    ['CAT-GA-COMMS-DIRECT', '個別連絡'],
    ['CAT-GA-COMMS-REMINDER', 'リマインド'],
  ]),
  ...smallCategories('CAT-GA-DIRECTORY', [
    ['CAT-GA-DIRECTORY-REGISTRATION', '登録情報'],
    ['CAT-GA-DIRECTORY-CONTACT', '連絡先'],
    ['CAT-GA-DIRECTORY-ORG', '所属・役職'],
    ['CAT-GA-DIRECTORY-ACTIVITY', '活動状況'],
    ['CAT-GA-DIRECTORY-EMERGENCY', '緊急連絡先'],
  ]),
  ...smallCategories('CAT-GA-ASSET', [
    ['CAT-GA-ASSET-COMMON', '共通素材'],
    ['CAT-GA-ASSET-AVATAR', 'アバター'],
    ['CAT-GA-ASSET-COSTUME', '衣装'],
    ['CAT-GA-ASSET-PROP', '小物'],
    ['CAT-GA-ASSET-MEDIA', '画像・動画'],
    ['CAT-GA-ASSET-DISTRIBUTION', '配布データ'],
    ['CAT-GA-ASSET-TOOL', '使用ツール'],
  ]),
  ...smallCategories('CAT-GA-EXPENSE', [
    ['CAT-GA-EXPENSE-REQUEST', '購入申請'],
    ['CAT-GA-EXPENSE-BUDGET', '予算確認'],
    ['CAT-GA-EXPENSE-PAYMENT', '支払い'],
    ['CAT-GA-EXPENSE-REIMBURSEMENT', '立替精算'],
    ['CAT-GA-EXPENSE-HISTORY', '購入履歴'],
  ]),
  ...smallCategories('CAT-GA-EXTERNAL', [
    ['CAT-GA-EXTERNAL-INQUIRY', '問い合わせ'],
    ['CAT-GA-EXTERNAL-COLLAB', 'コラボ窓口'],
    ['CAT-GA-EXTERNAL-COMPLAINT', '苦情対応'],
    ['CAT-GA-EXTERNAL-CONTACT', '関係者連絡'],
  ]),
  ...smallCategories('CAT-GA-LEGAL', [
    ['CAT-GA-LEGAL-CONTRACT', '契約'],
    ['CAT-GA-LEGAL-NDA', 'NDA'],
    ['CAT-GA-LEGAL-PUBLISHING', '掲載許可'],
    ['CAT-GA-LEGAL-ASSET', '素材使用許可'],
    ['CAT-GA-LEGAL-SECONDARY', '二次利用許可'],
    ['CAT-GA-LEGAL-CREDIT', 'クレジット条件'],
  ], false),
];

const itMiddle: Category[] = [
  middle('CAT-IT-ACCESS', 'CAT-IT', 'アカウント・権限管理', 1),
  middle('CAT-IT-DEVELOPMENT', 'CAT-IT', 'システム開発', 2),
  middle('CAT-IT-BUG', 'CAT-IT', '不具合対応', 3),
  middle('CAT-IT-DATA', 'CAT-IT', 'データ管理', 4),
  middle('CAT-IT-SECURITY', 'CAT-IT', 'セキュリティ対策', 5),
  middle('CAT-IT-SUPPORT', 'CAT-IT', '利用支援', 6),
];

const itSmall: Category[] = [
  ...smallCategories('CAT-IT-ACCESS', [
    ['CAT-IT-ACCESS-INVITE', '招待'],
    ['CAT-IT-ACCESS-PROFILE', '登録情報変更'],
    ['CAT-IT-ACCESS-DISCORD-ROLE', 'Discordロール'],
    ['CAT-IT-ACCESS-TOOL', 'ツール権限'],
    ['CAT-IT-ACCESS-FOLDER', 'フォルダ権限'],
    ['CAT-IT-ACCESS-SUSPEND', '利用停止'],
    ['CAT-IT-ACCESS-DELETE', '削除'],
    ['CAT-IT-ACCESS-REVIEW', '定期確認'],
  ]),
  ...smallCategories('CAT-IT-DEVELOPMENT', [
    ['CAT-IT-DEVELOPMENT-FEATURE', '新機能'],
    ['CAT-IT-DEVELOPMENT-SPEC', '仕様変更'],
    ['CAT-IT-DEVELOPMENT-UI', 'UI改善'],
    ['CAT-IT-DEVELOPMENT-AUTOMATION', '自動化'],
    ['CAT-IT-DEVELOPMENT-INTEGRATION', '外部連携'],
    ['CAT-IT-DEVELOPMENT-INTERNAL', '内部改善'],
  ]),
  ...smallCategories('CAT-IT-BUG', [
    ['CAT-IT-BUG-REPORT', '不具合受付'],
    ['CAT-IT-BUG-INVESTIGATE', '原因調査'],
    ['CAT-IT-BUG-FIX', '修正'],
    ['CAT-IT-BUG-VERIFY', '動作確認'],
    ['CAT-IT-BUG-COMPLETE', '対応完了'],
  ]),
  ...smallCategories('CAT-IT-DATA', [
    ['CAT-IT-DATA-BACKUP', 'バックアップ'],
    ['CAT-IT-DATA-RESTORE', '復元'],
    ['CAT-IT-DATA-MIGRATION', 'データ移行'],
    ['CAT-IT-DATA-ARCHIVE', 'アーカイブ'],
    ['CAT-IT-DATA-DELETE', '削除'],
  ]),
  ...smallCategories('CAT-IT-SECURITY', [
    ['CAT-IT-SECURITY-ACCESS-REVIEW', '権限定期点検'],
    ['CAT-IT-SECURITY-OFFBOARD', '退任者権限確認'],
    ['CAT-IT-SECURITY-PUBLIC-LINK', '公開リンク確認'],
    ['CAT-IT-SECURITY-SUSPICIOUS', '不審アカウント対応'],
    ['CAT-IT-SECURITY-LEAK', '情報漏洩対応'],
    ['CAT-IT-SECURITY-MISSHARE', '誤共有対応'],
    ['CAT-IT-SECURITY-INCIDENT', 'インシデント記録'],
  ]),
  ...smallCategories('CAT-IT-SUPPORT', [
    ['CAT-IT-SUPPORT-GUIDANCE', '操作案内'],
    ['CAT-IT-SUPPORT-QUESTION', '質問対応'],
    ['CAT-IT-SUPPORT-MANUAL', 'マニュアル作成'],
    ['CAT-IT-SUPPORT-ENVIRONMENT', '環境確認'],
    ['CAT-IT-SUPPORT-TROUBLE', 'トラブル対応'],
  ]),
];

const productionMiddle: Category[] = [
  middle('CAT-PRD-WORLD', 'CAT-PRD', 'ワールド制作', 1),
  middle('CAT-PRD-AVATAR', 'CAT-PRD', 'アバター制作', 2),
  middle('CAT-PRD-COSTUME', 'CAT-PRD', '衣装制作', 3),
  middle('CAT-PRD-PROP', 'CAT-PRD', '小物制作', 4),
  middle('CAT-PRD-GRAPHIC', 'CAT-PRD', 'グラフィック制作', 5),
  middle('CAT-PRD-VIDEO', 'CAT-PRD', '動画制作', 6),
  middle('CAT-PRD-PHOTO', 'CAT-PRD', '写真制作', 7),
  middle('CAT-PRD-AUDIO', 'CAT-PRD', '音響制作', 8),
  middle('CAT-PRD-WRITING', 'CAT-PRD', '文章制作', 9),
  middle('CAT-PRD-OTHER', 'CAT-PRD', 'その他制作', 10),
];

const commonProductionChildren = (
  parentId: string,
  idPrefix: string,
): Category[] => smallCategories(parentId, [
  [`${idPrefix}-NEW`, '新規制作'],
  [`${idPrefix}-REVAMP`, '改修'],
  [`${idPrefix}-FIX`, '修正'],
  [`${idPrefix}-COMPATIBILITY`, '対応追加'],
  [`${idPrefix}-OPTIMIZE`, '最適化'],
  [`${idPrefix}-RELEASE`, '公開準備'],
]);

const productionSmall: Category[] = [
  ...commonProductionChildren('CAT-PRD-WORLD', 'CAT-PRD-WORLD'),
  ...commonProductionChildren('CAT-PRD-AVATAR', 'CAT-PRD-AVATAR'),
  ...commonProductionChildren('CAT-PRD-COSTUME', 'CAT-PRD-COSTUME'),
  ...commonProductionChildren('CAT-PRD-PROP', 'CAT-PRD-PROP'),
  ...smallCategories('CAT-PRD-GRAPHIC', [
    ['CAT-PRD-GRAPHIC-LOGO', 'ロゴ'],
    ['CAT-PRD-GRAPHIC-KEY-VISUAL', 'キービジュアル'],
    ['CAT-PRD-GRAPHIC-ANNOUNCEMENT', '告知画像'],
    ['CAT-PRD-GRAPHIC-POSTER', 'ポスター'],
    ['CAT-PRD-GRAPHIC-GUIDE-PANEL', '案内パネル'],
    ['CAT-PRD-GRAPHIC-VENUE-SIGN', '会場内表示'],
    ['CAT-PRD-GRAPHIC-THUMBNAIL', 'サムネイル'],
  ]),
  ...smallCategories('CAT-PRD-VIDEO', [
    ['CAT-PRD-VIDEO-INTRO', '紹介動画'],
    ['CAT-PRD-VIDEO-ANNOUNCEMENT', '告知動画'],
    ['CAT-PRD-VIDEO-RECORD', '記録動画'],
    ['CAT-PRD-VIDEO-SHORT', 'ショート動画'],
    ['CAT-PRD-VIDEO-OTHER', 'その他動画'],
  ]),
  ...smallCategories('CAT-PRD-PHOTO', [
    ['CAT-PRD-PHOTO-ANNOUNCEMENT', '告知写真'],
    ['CAT-PRD-PHOTO-INTRO', '紹介写真'],
    ['CAT-PRD-PHOTO-RECORD', '記録写真'],
    ['CAT-PRD-PHOTO-PRODUCT', '商品写真'],
    ['CAT-PRD-PHOTO-OTHER', 'その他写真'],
  ]),
  ...smallCategories('CAT-PRD-AUDIO', [
    ['CAT-PRD-AUDIO-BGM', 'BGM'],
    ['CAT-PRD-AUDIO-SFX', '効果音'],
    ['CAT-PRD-AUDIO-VOICE', 'ボイス'],
    ['CAT-PRD-AUDIO-NARRATION', 'ナレーション'],
    ['CAT-PRD-AUDIO-VOLUME', '音量調整'],
  ]),
  ...smallCategories('CAT-PRD-WRITING', [
    ['CAT-PRD-WRITING-WORLD', '世界観設定'],
    ['CAT-PRD-WRITING-EVENT', 'イベント説明'],
    ['CAT-PRD-WRITING-MC-SCRIPT', '司会台本'],
    ['CAT-PRD-WRITING-INTRO', '紹介文'],
    ['CAT-PRD-WRITING-MANUAL', 'マニュアル'],
    ['CAT-PRD-WRITING-RULES', '規約・ガイドライン'],
  ]),
];

const publicityMiddle: Category[] = [
  middle('CAT-PR-PLANNING', 'CAT-PR', '広報企画', 1),
  middle('CAT-PR-POSTING', 'CAT-PR', '投稿・告知', 2),
  middle('CAT-PR-RECRUIT', 'CAT-PR', '募集広報', 3),
  middle('CAT-PR-SHOWCASE', 'CAT-PR', '制作物紹介', 4),
  middle('CAT-PR-COLLAB', 'CAT-PR', 'コラボ広報', 5),
  middle('CAT-PR-MEASUREMENT', 'CAT-PR', '効果測定', 6),
];

const publicitySmall: Category[] = [
  ...smallCategories('CAT-PR-PLANNING', [
    ['CAT-PR-PLANNING-AUDIENCE', '対象者決定'],
    ['CAT-PR-PLANNING-MEDIA', '媒体選定'],
    ['CAT-PR-PLANNING-POLICY', '投稿方針'],
    ['CAT-PR-PLANNING-ASSIGN', '担当割当'],
    ['CAT-PR-PLANNING-SCHEDULE', '投稿計画'],
  ]),
  ...smallCategories('CAT-PR-POSTING', [
    ['CAT-PR-POSTING-X', 'X投稿'],
    ['CAT-PR-POSTING-DISCORD', 'Discord告知'],
    ['CAT-PR-POSTING-VRCHAT', 'VRChatイベント登録'],
    ['CAT-PR-POSTING-PREVIEW', '開催予告'],
    ['CAT-PR-POSTING-RECRUIT', '募集開始'],
    ['CAT-PR-POSTING-PERFORMER', '出演者紹介'],
    ['CAT-PR-POSTING-LAST-CALL', '直前告知'],
    ['CAT-PR-POSTING-DAY-OF', '当日案内'],
    ['CAT-PR-POSTING-REPORT', '終了報告'],
  ]),
  ...smallCategories('CAT-PR-RECRUIT', [
    ['CAT-PR-RECRUIT-IMAGE', '募集画像'],
    ['CAT-PR-RECRUIT-COPY', '募集文'],
    ['CAT-PR-RECRUIT-HOWTO', '応募方法案内'],
    ['CAT-PR-RECRUIT-DEADLINE', '締切告知'],
    ['CAT-PR-RECRUIT-EXTRA', '追加募集'],
  ]),
  ...smallCategories('CAT-PR-SHOWCASE', [
    ['CAT-PR-SHOWCASE-WORLD', 'ワールド紹介'],
    ['CAT-PR-SHOWCASE-COSTUME', '衣装紹介'],
    ['CAT-PR-SHOWCASE-STAFF', 'スタッフ紹介'],
    ['CAT-PR-SHOWCASE-PROCESS', '制作過程'],
    ['CAT-PR-SHOWCASE-UPDATE', '更新情報'],
  ]),
  ...smallCategories('CAT-PR-COLLAB', [
    ['CAT-PR-COLLAB-CROSS-POST', '相互告知'],
    ['CAT-PR-COLLAB-CONTENT-REVIEW', '掲載内容確認'],
    ['CAT-PR-COLLAB-ASSET', '素材受け渡し'],
    ['CAT-PR-COLLAB-SCHEDULE', '投稿日時調整'],
    ['CAT-PR-COLLAB-STAKEHOLDER', '関係者確認'],
  ]),
  ...smallCategories('CAT-PR-MEASUREMENT', [
    ['CAT-PR-MEASUREMENT-IMPRESSIONS', '表示数'],
    ['CAT-PR-MEASUREMENT-REACTIONS', '反応数'],
    ['CAT-PR-MEASUREMENT-APPLICATIONS', '応募数'],
    ['CAT-PR-MEASUREMENT-PARTICIPANTS', '参加者数'],
    ['CAT-PR-MEASUREMENT-CLICKS', 'URLクリック数'],
    ['CAT-PR-MEASUREMENT-IMPROVEMENT', '改善案'],
  ]),
];

const qaMiddle: Category[] = [
  middle('CAT-QA-SPEC', 'CAT-QA', '仕様確認', 1),
  middle('CAT-QA-WORLD', 'CAT-QA', 'ワールド確認', 2),
  middle('CAT-QA-AVATAR', 'CAT-QA', 'アバター確認', 3),
  middle('CAT-QA-COSTUME', 'CAT-QA', '衣装確認', 4),
  middle('CAT-QA-PROP', 'CAT-QA', '小物確認', 5),
  middle('CAT-QA-DESIGN', 'CAT-QA', 'デザイン確認', 6),
  middle('CAT-QA-WRITING', 'CAT-QA', '文章確認', 7),
  middle('CAT-QA-PUBLICITY', 'CAT-QA', '広報物確認', 8),
  middle('CAT-QA-OPERATIONS', 'CAT-QA', '運営確認', 9),
  middle('CAT-QA-RIGHTS', 'CAT-QA', '権利・規約確認', 10),
  middle('CAT-QA-FINAL', 'CAT-QA', '最終承認', 11),
];

const qaSmall: Category[] = [
  ...smallCategories('CAT-QA-SPEC', [
    ['CAT-QA-SPEC-REQUIREMENTS', '要件照合'],
    ['CAT-QA-SPEC-MISSING', '不足確認'],
    ['CAT-QA-SPEC-MISMATCH', '認識違い'],
    ['CAT-QA-SPEC-CHANGES', '変更点'],
    ['CAT-QA-SPEC-APPROVAL', '承認'],
  ]),
  ...smallCategories('CAT-QA-WORLD', [
    ['CAT-QA-WORLD-BEHAVIOR', '動作'],
    ['CAT-QA-WORLD-FLOW', '導線'],
    ['CAT-QA-WORLD-DISPLAY', '表示'],
    ['CAT-QA-WORLD-PERFORMANCE', '負荷'],
    ['CAT-QA-WORLD-PLATFORM', 'Quest・PC'],
    ['CAT-QA-WORLD-CAPACITY', '人数テスト'],
  ]),
  ...smallCategories('CAT-QA-AVATAR', [
    ['CAT-QA-AVATAR-INSTALL', '導入'],
    ['CAT-QA-AVATAR-BEHAVIOR', '動作'],
    ['CAT-QA-AVATAR-SHAPEKEY', 'シェイプキー'],
    ['CAT-QA-AVATAR-GIMMICK', 'ギミック'],
  ]),
  ...smallCategories('CAT-QA-COSTUME', [
    ['CAT-QA-COSTUME-INSTALL', '導入'],
    ['CAT-QA-COSTUME-BEHAVIOR', '動作'],
    ['CAT-QA-COSTUME-CLIPPING', '破綻・貫通'],
  ]),
  ...smallCategories('CAT-QA-PROP', [
    ['CAT-QA-PROP-INSTALL', '導入'],
    ['CAT-QA-PROP-BEHAVIOR', '動作'],
    ['CAT-QA-PROP-GIMMICK', 'ギミック'],
  ]),
  ...smallCategories('CAT-QA-DESIGN', [
    ['CAT-QA-DESIGN-LAYOUT', 'レイアウト'],
    ['CAT-QA-DESIGN-TEXT-SIZE', '文字サイズ'],
    ['CAT-QA-DESIGN-COLOR', '色'],
    ['CAT-QA-DESIGN-VISIBILITY', '視認性'],
    ['CAT-QA-DESIGN-CONSISTENCY', '統一感'],
  ]),
  ...smallCategories('CAT-QA-WRITING', [
    ['CAT-QA-WRITING-TYPO', '誤字脱字'],
    ['CAT-QA-WRITING-STYLE', '表記統一'],
    ['CAT-QA-WRITING-FACTS', '日時・名称'],
    ['CAT-QA-WRITING-LINK', 'リンク'],
    ['CAT-QA-WRITING-CLARITY', '分かりやすさ'],
  ]),
  ...smallCategories('CAT-QA-PUBLICITY', [
    ['CAT-QA-PUBLICITY-COPY', '投稿文'],
    ['CAT-QA-PUBLICITY-IMAGE', '告知画像'],
    ['CAT-QA-PUBLICITY-PUBLISH-AT', '公開日時'],
    ['CAT-QA-PUBLICITY-NAMES', '関係者名'],
    ['CAT-QA-PUBLICITY-PERMISSION', '掲載許可'],
  ]),
  ...smallCategories('CAT-QA-OPERATIONS', [
    ['CAT-QA-OPERATIONS-REHEARSAL', 'リハーサル'],
    ['CAT-QA-OPERATIONS-MC', '司会進行'],
    ['CAT-QA-OPERATIONS-FLOW', 'スタッフ導線'],
    ['CAT-QA-OPERATIONS-ROLES', '役割理解'],
    ['CAT-QA-OPERATIONS-EMERGENCY', '緊急対応'],
  ]),
  ...smallCategories('CAT-QA-RIGHTS', [
    ['CAT-QA-RIGHTS-TERMS', '利用規約'],
    ['CAT-QA-RIGHTS-CREDIT', 'クレジット'],
    ['CAT-QA-RIGHTS-ASSET', '素材使用許可'],
    ['CAT-QA-RIGHTS-SECONDARY', '二次利用'],
    ['CAT-QA-RIGHTS-PRIVACY', '個人情報'],
  ]),
  ...smallCategories('CAT-QA-FINAL', [
    ['CAT-QA-FINAL-PUBLISH', '公開判定'],
    ['CAT-QA-FINAL-EVENT', '開催判定'],
    ['CAT-QA-FINAL-OWNER', '責任者承認'],
    ['CAT-QA-FINAL-CONFIRM', '公開確認'],
    ['CAT-QA-FINAL-RECORD', '完了記録'],
  ]),
];

/**
 * Static fallback master. In production this can seed
 * `workspace/catalog/categories`; IDs must never be regenerated from names.
 */
export const INITIAL_CATEGORY_MASTER: readonly Category[] = Object.freeze([
  ...majorCategories,
  ...planningMiddle,
  ...planningSmall,
  ...hrMiddle,
  ...hrSmall,
  ...generalAffairsMiddle,
  ...generalAffairsSmall,
  ...itMiddle,
  ...itSmall,
  ...productionMiddle,
  ...productionSmall,
  ...publicityMiddle,
  ...publicitySmall,
  ...qaMiddle,
  ...qaSmall,
]);

export interface CategoryIndex {
  byId: ReadonlyMap<string, Category>;
  childrenByParentId: ReadonlyMap<string | null, readonly Category[]>;
}

export function createCategoryIndex(
  categories: readonly Category[] = INITIAL_CATEGORY_MASTER,
): CategoryIndex {
  const byId = new Map<string, Category>();
  const childrenByParentId = new Map<string | null, Category[]>();

  for (const category of categories) {
    byId.set(category.id, category);
    const siblings = childrenByParentId.get(category.parentId) ?? [];
    siblings.push(category);
    childrenByParentId.set(category.parentId, siblings);
  }

  for (const siblings of childrenByParentId.values()) {
    siblings.sort((left, right) =>
      left.sortOrder - right.sortOrder || left.name.localeCompare(right.name, 'ja'));
  }

  return { byId, childrenByParentId };
}

export const CATEGORY_INDEX = createCategoryIndex();

export interface CategoryChildrenOptions {
  includeInactive?: boolean;
  includeSystem?: boolean;
  selectedIds?: readonly string[];
  level?: CategoryLevel;
}

export function getCategoryChildren(
  parentId: string | null,
  options: CategoryChildrenOptions = {},
  index: CategoryIndex = CATEGORY_INDEX,
): readonly Category[] {
  const selected = new Set(options.selectedIds ?? []);
  return (index.childrenByParentId.get(parentId) ?? []).filter(category => {
    if (options.level && category.level !== options.level) return false;
    if (!options.includeSystem && category.system && !selected.has(category.id)) return false;
    if (!options.includeInactive && !category.active && !selected.has(category.id)) return false;
    return true;
  });
}

export function getCategoryPath(
  categoryId: string | undefined,
  index: CategoryIndex = CATEGORY_INDEX,
): readonly Category[] {
  if (!categoryId) return [];
  const path: Category[] = [];
  const visited = new Set<string>();
  let current = index.byId.get(categoryId);

  while (current && !visited.has(current.id)) {
    path.unshift(current);
    visited.add(current.id);
    current = current.parentId ? index.byId.get(current.parentId) : undefined;
  }

  return path;
}

export function isCategorySelectionValid(
  selection: Partial<CategorySelection>,
  index: CategoryIndex = CATEGORY_INDEX,
): boolean {
  const major = selection.majorCategoryId
    ? index.byId.get(selection.majorCategoryId)
    : undefined;
  if (!major || major.level !== 1) return false;

  if (!selection.middleCategoryId) return !selection.smallCategoryId;
  const middle = index.byId.get(selection.middleCategoryId);
  if (!middle || middle.level !== 2 || middle.parentId !== major.id) return false;

  if (!selection.smallCategoryId) return true;
  const small = index.byId.get(selection.smallCategoryId);
  return Boolean(small && small.level === 3 && small.parentId === middle.id);
}

/**
 * Clears descendants that do not belong to the selected parent. This is the
 * state transition used by linked major/middle/small selects.
 */
export function reconcileCategorySelection(
  selection: Partial<CategorySelection>,
  index: CategoryIndex = CATEGORY_INDEX,
): Partial<CategorySelection> {
  const major = selection.majorCategoryId
    ? index.byId.get(selection.majorCategoryId)
    : undefined;
  if (!major || major.level !== 1) return {};

  const next: Partial<CategorySelection> = { majorCategoryId: major.id };
  const middle = selection.middleCategoryId
    ? index.byId.get(selection.middleCategoryId)
    : undefined;
  if (!middle || middle.level !== 2 || middle.parentId !== major.id) return next;

  next.middleCategoryId = middle.id;
  const small = selection.smallCategoryId
    ? index.byId.get(selection.smallCategoryId)
    : undefined;
  if (small && small.level === 3 && small.parentId === middle.id) {
    next.smallCategoryId = small.id;
  }
  return next;
}

export function validateCategoryMaster(
  categories: readonly Category[] = INITIAL_CATEGORY_MASTER,
): string[] {
  const issues: string[] = [];
  const index = createCategoryIndex(categories);
  if (index.byId.size !== categories.length) issues.push('カテゴリIDが重複しています。');

  for (const category of categories) {
    if (/[.#$\[\]/]/.test(category.id)) {
      issues.push(`${category.id}: Firebase Realtime Databaseで使えない文字を含みます。`);
    }
    if (category.level === 1 && category.parentId !== null) {
      issues.push(`${category.id}: 大カテゴリのparentIdはnullである必要があります。`);
    }
    if (category.level > 1) {
      const parent = category.parentId ? index.byId.get(category.parentId) : undefined;
      if (!parent) issues.push(`${category.id}: 親カテゴリがありません。`);
      else if (parent.level !== category.level - 1) {
        issues.push(`${category.id}: 親カテゴリの階層が不正です。`);
      }
    }
  }

  return issues;
}
