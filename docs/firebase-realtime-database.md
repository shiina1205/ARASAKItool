# Firebase Realtime Database 構成

このアプリはCloud Firestoreではなく、Firebase Realtime Databaseを使用します。
`TEAM_ID` は `assets/js/config.js` で指定し、標準値は `arasaki-shipyard` です。

## データツリー

```text
teams/
└── {teamId}/
    ├── members/
    │   └── {uid}/                 # 認可の正本（role / active）
    ├── profiles/
    │   └── {uid}/                 # 表示名、Discord、VRChat、画像
    ├── joinRequests/
    │   └── {uid}/                 # 未登録ユーザーの参加申請
    ├── planner/                   # v1からの移行元。新規書き込みには使わない
    └── workspace/
        ├── meta/                  # schemaVersion、更新者、移行情報
        ├── config/                # settings、preferences、menuConfig
        ├── tasks/
        │   ├── operations/{taskId}
        │   ├── staff/{taskId}
        │   └── cast/{taskId}
        ├── events/{eventId}
        ├── projects/{projectId}
        ├── meetings/{meetingId}
        ├── notes/{noteId}
        ├── futureItems/{itemId}
        ├── yearlyLogs/{year}
        ├── weeklyLogs/{weekKey}
        ├── dailyEntries/{yyyy-mm-dd}
        └── changeLog/{changeId}
```

配列データはFirebase上ではIDをキーにしたオブジェクトとして保存します。これにより、
レコード単位の差分同期ができ、配列全体の上書きを避けられます。

## 権限

| ロール | operationsタスク | staffタスク | castタスク | 共通データ | メンバー管理 |
|---|---:|---:|---:|---:|---:|
| owner | 読み書き | 読み書き | 読み書き | 読み書き | 全員 |
| operations | 読み書き | 読み書き | 読み書き | 読み書き | staff / cast |
| staff | 不可 | 読み書き | 読み書き | 読み書き | 不可 |
| cast | 不可 | 不可 | 読み書き | 読み書き | 不可 |
| 未登録 | 不可 | 不可 | 不可 | 不可 | 自分の参加申請のみ |

`members/{uid}` の `active: true` がすべてのワークスペース権限の前提です。
`profiles` のroleは表示用であり、認可判定には必ず `members` を使用します。

`admin` / `member` / `viewer` は旧データ互換用で、それぞれ
`operations` / `staff` / `cast` として扱います。新規データでは新ロール名を使用します。

## 初期設定

1. Firebase ConsoleでWebアプリを作成します。
2. Authenticationのログイン方法でGoogleを有効にします。
3. Realtime Databaseを作成します。リージョンは `databaseURL` と一致させます。
4. `config.example.js` を `config.js` にコピーし、Firebase Web設定を入力します。
5. `database.rules.json` をConsoleのRealtime Database > ルールへ貼り付けて公開します。
6. 最初のownerをConsoleから手動登録します。

最初のownerの例:

```json
{
  "teams": {
    "arasaki-shipyard": {
      "members": {
        "GOOGLE_AUTH_UID": {
          "displayName": "管理者名",
          "email": "owner@example.com",
          "role": "owner",
          "active": true
        }
      }
    }
  }
}
```

`GOOGLE_AUTH_UID` はAuthentication > Usersに表示されるUIDと完全一致させます。
初回ownerログイン時にプロフィールと `workspace` schema v2が作成されます。

## CLIでのルール反映

Firebase CLIで対象プロジェクトを選択した後に実行します。

```bash
firebase use your-project-id
firebase deploy --only database
```

本番へ反映する前に、Firebase ConsoleのRules PlaygroundまたはLocal Emulator Suiteで
各ロールの許可・拒否ケースを確認してください。
