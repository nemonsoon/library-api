# 開発

このリポジトリを手元で動かし、変更を検査するための手順をまとめる。
初めて動かすときの最短手順は README の「セットアップ」にある。
ここには、そのあと日常的に使うコマンドと設定を置く。

## リポジトリの構成

リポジトリ直下は npm のワークスペースで、配下に2つのパッケージがある。

| パッケージ | 場所 | 中身 |
| --- | --- | --- |
| `api` | `apps/api` | HTTP API、Prisma のスキーマ、OpenAPI の仕様、テスト |
| `web` | `apps/web` | ウェブ画面 |

直下から `npm run test` `npm run typecheck` `npm run check` を実行すると、両方のパッケージに対して走る。
個別に動かすときは `npm run <スクリプト名> --workspace api` のように指定する。

## 開発サーバーの起動

API と画面は別のプロセスで動く。
画面だけを起動しても一覧は空のまま失敗するので、API を先に起動する。

```bash
npm run dev:api
```

`http://localhost:3000` で待ち受ける。
`tsx` が TypeScript をそのまま実行するため、ビルドの手順は要らない。

別の端末で画面を起動する。

```bash
npm run dev:web
```

`http://localhost:5173` で待ち受ける。
画面からの `/api` 宛ての要求は、Vite の開発サーバーが `http://localhost:3000` へ転送し、そのときに `/api` を取り除く。
画面のコードは自分と同じ生成元だけを見ればよく、生成元をまたぐ設定を持たない。

## 検査

```bash
npm test           # テストを実行する（Vitest）
npm run typecheck  # 型を検査する（tsc --noEmit）
npm run check      # 書式と静的検査を確認する（Biome、ファイルは書き換えない）
npm run lint:fix   # 書式と静的検査の指摘を自動で直す（Biome）
```

`npm run check` は確認だけを行う。
指摘を直したいときは `npm run lint:fix` を使う。

Biome の設定は直下の `biome.json` にある。
字下げはタブ、文字列は二重引用符で揃える。
TanStack Router が生成する `apps/web/src/routeTree.gen.ts` は、生成物なので検査の対象から外している。

## データベース

SQLite のファイルは `apps/api/dev.db` に置かれ、リポジトリには含めない。

```bash
npm run db:push    # スキーマの定義をデータベースへ反映する
npm run db:seed    # 初期データを投入する（既存のデータは消える）
```

`npm run db:seed` は本40件、ユーザー10件、貸出13件を入れる。
貸出のうち3件は返却期限を過ぎており、3件は返却済みである。
残りは期限までの日数が散らばるので、返却予定の並びを投入した直後から確かめられる。

実行のたびに既存のデータを消してから入れ直すため、何度実行しても同じ状態から始められる。

## 環境変数

`apps/api/.env.example` をコピーして `apps/api/.env` を作る。

| 変数 | 用途 | 例 |
| --- | --- | --- |
| `DATABASE_URL` | SQLite の接続先 | `file:./dev.db` |
| `PORT` | API の待ち受けポート | `3000` |

`PORT` を変えたときは、`apps/web/vite.config.ts` の転送先も合わせて変える。

## Node.js の版

`mise.toml` で Node.js 24 に固定している。
[mise](https://mise.jdx.dev/) を入れていれば、リポジトリに入った時点で切り替わる。
入れていない場合は、Node.js 24 系を自分で用意する。

## ブランチとコミット

作業用のブランチは `<種別>/<Issue 番号>-<内容>` の形で切る。
`feat/8-public-web-ui` のように、どの Issue に対応する作業かが名前から分かるようにする。

コミットメッセージは Conventional Commits に従う。
対象のパッケージを括弧で添える（`feat(web): ...`、`fix(api): ...`）。
