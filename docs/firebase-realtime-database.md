# Firebase Realtime Database 構成

このアプリはCloud Firestoreではなく、Firebase Realtime Databaseを使用します。
`TEAM_ID` は `assets/js/config.js` で指定し、標準値は `arasaki-shipyard` です。

## schema v3のデータツリー

```text
teams/
└── {teamId}/
    ├── members/
    │   └── {uid}/                         # 認可の正本（role / active）
    ├── profiles/
    │   └── {uid}/                         # 表示名、Discord、VRChat、画像
    ├── joinRequests/
    │   └── {uid}/                         # 未登録ユーザーの参加申請
    ├── planner/                           # v1からの移行元。新規書き込みには使わない
    └── workspace/
        ├── meta/
        │   ├── schemaVersion              # 3
        │   ├── categoryMigrationVersion   # カテゴリ移行済みなら1
        │   └── ...                        # 更新者・移行日時
        ├── config/
        │   ├── settings
        │   ├── preferences
        │   ├── menuConfig
        │   ├── categoryMaster             # 独立singleton
        │   └── projectTemplates           # 独立singleton
        ├── tasks/
        │   ├── owner/{taskId}
        │   ├── operations/{taskId}
        │   ├── staff/{taskId}
        │   └── cast/{taskId}
        ├── projects/
        │   ├── owner/{projectId}
        │   ├── operations/{projectId}
        │   ├── staff/{projectId}
        │   └── cast/{projectId}
        ├── notes/                          # ideaもこの配下
        │   ├── owner/{noteId}
        │   ├── operations/{noteId}
        │   ├── staff/{noteId}
        │   └── cast/{noteId}
        ├── events/{eventId}                # チーム用イベントだけ
        ├── meetings/{meetingId}
        ├── schedulePolls/{pollId}
        ├── futureItems/{itemId}
        ├── yearlyLogs/{year}
        ├── weeklyLogs/{weekKey}
        ├── dailyEntries/{yyyy-mm-dd}
        └── changeLog/{changeId}

users/
└── {uid}/
    └── workspace/
        ├── tasks/{taskId}                  # 個人用タスク
        └── events/{eventId}                # 個人用イベント
```

配列データはFirebase上ではIDをキーにしたオブジェクトとして保存します。タスク、
プロジェクト、ノート、イベントなどの更新はID単位のmulti-location updateで送り、
配列や公開範囲フォルダ全体を上書きしません。

## 公開範囲

`tasks`、`projects`、`notes` は公開範囲ごとに物理的なパスを分けます。Realtime
Databaseのルールは取得結果をレコード単位で絞り込まないため、フラットな一覧のまま
クライアント側だけで非表示にする構成には戻さないでください。

| ロール | owner | operations | staff | cast |
|---|---:|---:|---:|---:|
| owner | 読み書き | 読み書き | 読み書き | 読み書き |
| operations / admin | 不可 | 読み書き | 読み書き | 読み書き |
| staff / member | 不可 | 不可 | 読み書き | 読み書き |
| cast / viewer | 不可 | 不可 | 不可 | 読み書き |

レコード内の `visibility` が公開範囲の正本で、保存先bucketと必ず一致させます。
タスクは旧UI・旧データとの互換用に `audience` も保持し、保存時は
`audience === visibility` に正規化します。旧タスクの読込時は、`visibility` がなければ
`audience`、両方なければ `staff` として扱います。

タスクの作成権限は従来仕様も維持します。`owner` / `operations` タスクの作成・更新は
対応する管理ロールだけが行えます。`staff` / `cast` はownerまたはoperationsが新規作成し、
閲覧可能なスタッフは既存レコードを更新できます。プロジェクトとノートは、各bucketを
閲覧できるロールがそのbucketを読み書きできます。

`members/{uid}` の `active: true` がチームワークスペース権限の前提です。
`profiles` のroleは表示用であり、認可判定には必ず `members` を使用します。
`admin` / `member` / `viewer` はそれぞれ `operations` / `staff` / `cast` と互換です。

## カテゴリマスタとテンプレート

`categoryMaster` と `projectTemplates` は `settings` に混在させず、
`workspace/config` 配下の独立したsingletonとして読み込み・監視します。全activeメンバーが
読み込めますが、書き込みはownerだけです。クライアントがowner以外では差分を生成しない
ことに加え、Realtime Database Rulesでも直接書き込みを拒否するため、UIを迂回しても
変更できません。

カテゴリ移行完了フラグは `workspace/meta/categoryMigrationVersion: 1` です。この値は
ownerまたはoperations（旧 `admin` を含む）だけが設定できます。

## ブラウザ画面の分離

同じFirebase AuthenticationとRealtime Databaseを使い、利用目的ごとにURLを分けます。

- `/app/`: スタッフ・参加者の日常利用画面
- `/owner/`: イベントオーナーの管理画面

`/owner/` は `members/{uid}/role` が `owner` のユーザーだけが利用できます。画面側で
非ownerの読み込みを停止することに加え、データの書き込み権限は引き続きRealtime
Database Rulesで判定します。カテゴリマスタ、テンプレート、スタッフ管理などの管理項目は
オーナー画面に集約し、両画面は同じワークスペースデータを参照します。

## 個人ワークスペース

`workspaceId: "personal"` のタスクとイベントは
`users/{uid}/workspace` だけへ保存します。本人以外はread/writeできません。チーム側の
`events` と公開範囲別 `tasks` のvalidateでも `workspaceId: "personal"` を拒否するため、
個人用レコードの詳細をチーム共通パスへ誤保存できません。

ログイン時は、許可されたチームbucketと本人の個人パスを並行して読み込み、画面へ渡す
stateでマージします。保存時は同じstateを再びチーム用・個人用へ分割し、両rootに対して
ID単位の差分を1回のmulti-location updateで送ります。個人からチーム、またはチームから
個人へ移動した場合も、旧パスの削除と新パスの追加を同じ更新に含めます。

## schema v2からv3への移行

v2では `projects/{projectId}` と `notes/{noteId}` がフラットでした。v3への初回接続時、
ownerが次の移行を実行します。

1. `workspace/meta/schemaVersion` を確認する。
2. フラットなprojects・notesを読む。
3. レコードの `visibility` に対応するbucketへコピーする。
4. `visibility` がない旧レコードは `staff` とする。
5. 旧フラットパスを削除し、`schemaVersion: 3` と移行日時を記録する。
6. 既存のbucket形式タスクは `visibility` と `audience` をbucket名へ正規化する。

コピー、旧パス削除、schema更新は1回のatomic updateです。移行処理は移行先に同じIDが
すでにある場合に上書きせず、途中状態に対して再実行しても重複を作らない設計です。
schema v2の環境へ最初にoperations以下で入った場合は、ownerによる移行が必要である旨を
表示します。

workspace自体がまだない場合は、従来どおりownerまたはoperationsが `planner` または
ローカルstateから初期化できます。この初期化は最初からschema v3のbucket構造を使い、
そのログインユーザーの個人タスク・イベントは同時に `users/{uid}/workspace` へ分離します。

ルールを先に公開してからv3対応クライアントを公開してください。旧v2ルールは
`schemaVersion: 3` や新しいbucketを許可しません。

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
初回ownerログイン時にプロフィールとworkspace schema v3が作成されます。

## Hosting・ローカル開発時の設定

Firebase Hosting本番では、予約URL `/__/firebase/init.json` から、そのHostingサイトに
紐づくFirebase Web設定を自動取得します。API設定をGitHubやビルド環境へ登録する必要は
ありません。`TEAM_ID` は `arasaki-shipyard` を使用します。

ViteなどFirebase Hosting以外のローカルサーバーでは予約URLが利用できないため、
`config.example.js` を `config.js` にコピーしてFirebase Web設定を入力してください。
`config.js` はGit管理対象外です。

## CLIでのルール反映

Firebase CLIで対象プロジェクトを選択した後に実行します。

```bash
firebase use your-project-id
firebase deploy --only database
```

本番へ反映する前にFirebase ConsoleのRules PlaygroundまたはLocal Emulator Suiteで、
未認証、inactive、全ロール、旧互換ロール、他人の `users/{uid}/workspace` について
許可・拒否ケースを確認してください。
