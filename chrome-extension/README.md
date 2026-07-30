# ARASAKI Staff Planner VRChat連携

Chromeにログイン済みのVRChatセッションを使い、プロフィールの表示名だけを
Staff Plannerへ返す拡張機能です。VRChatのパスワード、Cookie、認証トークンは
Staff PlannerやFirebaseへ送信・保存しません。

## インストール

1. Chromeで `chrome://extensions/` を開きます。
2. 右上の「デベロッパー モード」を有効にします。
3. 「パッケージ化されていない拡張機能を読み込む」を押します。
4. この `chrome-extension` フォルダーを選びます。
5. 同じChromeで `https://vrchat.com/home` にログインします。

マイページにVRChatプロフィールURLを入力して保存すると表示名を自動取得します。
VRChat側で改名した後は「VRChat名を再読み込み」を押してください。

## Plannerの公開先を変更する場合

`manifest.json` の最初の `content_scripts.matches` に、新しいPlannerのHTTPS URLを
追加してから拡張機能を再読み込みしてください。権限を必要最小限にするため、
すべてのWebサイトへのアクセス権は要求していません。
