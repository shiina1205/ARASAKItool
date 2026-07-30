# ARASAKI Staff Planner

React 19、TypeScript、Viteを使ったスタッフ向けプランナーです。

## ローカルで開く

Node.js 18以上をインストールしたうえで、OSに合わせて次のファイルを実行します。

- Windows: `ローカル起動.bat` をダブルクリック
- macOS / Linux: ターミナルで `./ローカル起動.command` を実行

初回だけ必要なパッケージを自動インストールします。起動後、ブラウザで
`http://localhost:5173` を開いてください。終了する場合は起動した画面で
`Ctrl + C` を押します。

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

Cloudflare Pagesでは、プロジェクトの「Settings → Variables and Secrets」に
`FIREBASE_CONFIG_JSON` を追加し、Firebase Consoleに表示される
`firebaseConfig` オブジェクトの中身をJSONとして設定してください。ビルド時に
`dist/assets/js/config.js` が生成されるため、Firebase設定値はGitへコミットされません。

```json
{
  "apiKey": "...",
  "authDomain": "...firebaseapp.com",
  "databaseURL": "https://...firebaseio.com",
  "projectId": "...",
  "appId": "..."
}
```

チームIDを変更する場合だけ、追加で `FIREBASE_TEAM_ID` を設定します。
未指定時は `arasaki-shipyard` が使用されます。

ローカル開発では `Arasaki_Staff_Planner_v0_8_Deploy/assets/js/config.example.js` を
`config.js` にコピーして値を設定できます。実値を含む `config.js` とビルド成果物の
`dist` はGit管理対象外です。

## VRChat表示名連携

マイページでVRChatプロフィールURLから表示名を取得する場合は、専用Chrome拡張
機能を使用します。インストール方法は
[`chrome-extension/README.md`](chrome-extension/README.md) を参照してください。

拡張機能はChromeでログイン中のVRChatプロフィールを一時的な非表示タブで確認し、
ユーザーIDと表示名だけをPlannerへ返します。VRChatのパスワード、Cookie、
認証トークンはPlannerやFirebaseへ保存しません。
