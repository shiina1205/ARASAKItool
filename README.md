# ARASAKI Staff Planner

React 19、TypeScript、Viteを使ったスタッフ向けプランナーです。

## 開発

```bash
npm install
npm run dev
```

型チェックと本番ビルド:

```bash
npm run build
```

## 移行方針

既存のDOMベース画面とFirebaseデータ形式を壊さないよう、Reactの
`AppBootstrap` が従来機能を起動する段階移行構成です。新しい画面・状態管理は
`Arasaki_Staff_Planner_v0_8_Deploy/src` にTypeScriptで追加し、既存機能は画面単位で
Reactコンポーネントへ移行できます。
