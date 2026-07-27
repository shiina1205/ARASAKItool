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

## Firebase

Realtime Databaseの構成、権限、初期owner登録、ルールの反映方法は
[`docs/firebase-realtime-database.md`](docs/firebase-realtime-database.md) を参照してください。

Firebase Hostingでは `/__/firebase/init.json` から設定を自動取得します。
Cloudflare PagesなどFirebase Hosting以外では、起動コード内の公開Web設定を使用します。
別のFirebaseプロジェクトを使うローカル開発では
`Arasaki_Staff_Planner_v0_8_Deploy/assets/js/config.example.js` を参考に設定してください。
