# Library API

書籍の登録、貸出、返却を扱う HTTP API と、蔵書の貸出状況を一覧するウェブ画面。
クリーンアーキテクチャで層を分離し、業務ルールをフレームワークやデータベースから独立させることを設計の軸に置いている。

![蔵書を表で並べ、右に貸出中の冊数と返却期限の超過件数、書籍の登録欄を表示した画面](docs/images/screenshot.png)

## できること

画面は1枚で、左が蔵書の一覧、右が詳細の列になっている。
一覧は登録日の新しい順に並び、桁の見出しが並び順と一致する。
行を選ぶと、右の列が全体の状況からその書籍の詳細に切り替わり、貸出と返却の窓口が出る。

| 操作 | 画面 | API |
| --- | --- | --- |
| 書籍の登録 | ○ | `POST /books` |
| 書籍の貸出 | ○ | `POST /loans` |
| 書籍の返却 | ○ | `POST /loans/return` |
| 蔵書の一覧 | ○ | `GET /books` |
| 書籍の取得 | | `GET /books/:id` |
| ユーザーの一覧 | | `GET /users` |
| ユーザーの作成 | | `POST /users` |

返却期限を過ぎているかどうかは、返却期限と現在時刻から画面側で判定する。

### 業務ルール

- 貸出中の書籍は再度貸し出せない
- 返却済みの貸出履歴は再度返却できない
- 返却期限は貸出日の14日後
- 同一ユーザーの同時貸出は5冊まで

## 設計

依存の向きは `Infrastructure → Adapter → Application → Domain`。
内側の層は外側の層を参照しない。

| 層 | 責務 | ディレクトリ |
| --- | --- | --- |
| Domain | エンティティ、業務ルール、抽象インターフェース | `apps/api/src/domain` |
| Application | ユースケース、DTO、トランザクションの抽象 | `apps/api/src/application` |
| Adapter | Controller、Repository の実装、入力検証 | `apps/api/src/adapter` |
| Infrastructure | Express の起動、依存性の組み立て、ルーティング | `apps/api/src/infrastructure` |

依存性の組み立ては `apps/api/src/infrastructure/web/app.ts` に集約している。

失敗の理由は層ごとに置き場所が分かれ、それがそのまま状態番号になる。
要求の形の誤りが `400`、対象が無いことが `404`、業務ルールに反する操作が `409` である。
`404` と `409` の本文には理由がそのまま入るため、呼び出し側は再試行すべきかを判断できる。

画面は Mantine 9 の既定の意匠をそのまま使い、独自のテーマも手書きの部品も置かない。

層ごとの責務と要求の流れは [`docs/clean-architecture.md`](docs/clean-architecture.md)、
採った案と退けた案は [`docs/design-decisions.md`](docs/design-decisions.md) にある。

## 技術スタック

| 分類 | 技術 |
| --- | --- |
| 言語 | TypeScript（ESM） |
| 実行環境 | Node.js 24（`mise.toml` で固定） |
| パッケージ管理 | npm ワークスペース |
| Web フレームワーク | Express 5 |
| ORM | Prisma 7 |
| データベース | SQLite（`@prisma/adapter-better-sqlite3`） |
| 入力検証 | Zod 4 |
| API 仕様 | OpenAPI（`apps/api/openapi.yml`） |
| 画面 | React 19、Vite 8、TanStack Router |
| 画面の部品 | Mantine 9、Lucide |
| テスト | Vitest |
| 静的検査 | Biome |

## セットアップ

```bash
git clone https://github.com/nemonsoon/library-api.git
cd library-api

npm install

cp apps/api/.env.example apps/api/.env

npm run db:push
npm run db:seed
```

`npm run db:seed` は蔵書12件、ユーザー4件、貸出5件を投入する。
貸出のうち1件は返却期限を過ぎており、1件は返却済みである。

API と画面は別のプロセスで動く。
画面は API を呼ぶので、API を先に起動する。

```bash
npm run dev:api    # http://localhost:3000
```

別の端末で画面を起動する。

```bash
npm run dev:web    # http://localhost:5173
```

`http://localhost:5173` を開くと、上の写真の画面になる。

## API 仕様

起動中の API が、仕様を2つの形で配信する。

| URL | 内容 |
| --- | --- |
| `http://localhost:3000/docs` | Swagger UI。各エンドポイントをブラウザ上で試せる |
| `http://localhost:3000/openapi.yml` | OpenAPI 仕様そのもの |

仕様の原本は [`apps/api/openapi.yml`](apps/api/openapi.yml)。

`GET /books` は各書籍に `currentLoan` を添える。
返却されていない貸出があれば借り主と貸出日と返却期限が入り、無ければ `null` になる。
詳細を表示する呼び出し側が、書籍ごとに追加の取得をしなくて済む。

## 現在の制約

ローカル実行を想定しており、本番環境への配備は行っていない。
以下は未実装で、[Issues](https://github.com/nemonsoon/library-api/issues) で管理している。

| 未実装のもの | 影響 |
| --- | --- |
| 認証と認可 | 任意のユーザーの識別子を指定すれば、誰でも貸出と返却ができる |

一覧を返す2つのエンドポイントは、蔵書とユーザーの全件をそのまま返す。
ページングも絞り込みの引数も持たない。

## ドキュメント

| 文書 | いつ読むか |
| --- | --- |
| [アーキテクチャ](docs/clean-architecture.md) | 層の責務と依存の向きを確かめるとき |
| [設計判断](docs/design-decisions.md) | 「なぜそうなっていないか」を知りたいとき |
| [開発](docs/development.md) | 手元で動かし、変更を検査するとき |

## ライセンス

[MIT](LICENSE)
