# アーキテクチャ

## 概要

層は4つあり、依存は外側から内側へ一方向に向かいます。
以下は本の登録を例に、1つの要求が層をどう通るかを追ったものです。
同じ構造が貸出と返却にも当てはまります。

## アーキテクチャ全体図

```mermaid
graph TB
    subgraph "Infrastructure Layer (外部フレームワーク層)"
        App[app.ts<br/>依存性注入・起動]
        Router[bookRouter.ts<br/>ルーティング設定]
    end

    subgraph "Adapter Layer (インターフェースアダプター層)"
        Controller[BookController<br/>HTTP層の制御]
        Repository[PrismaBookRepository<br/>DB実装]
        UuidGen[UuidGenerator<br/>ID生成実装]
    end

    subgraph "Application Layer (ユースケース層)"
        UseCase[AddBookUseCase<br/>本の追加ロジック]
        UseCaseInterface[AddBookUseCaseInterface]
        RequestDTO[AddBookRequestDto]
        ResponseDTO[AddBookResponseDto]
    end

    subgraph "Domain Layer (ドメイン層)"
        Entity[Book Entity<br/>ビジネスルール]
        RepoInterface[BookRepositoryInterface]
        IdGenInterface[IdGeneratorInterface]
    end

    %% 依存関係（外→内）
    App --> Controller
    App --> UseCase
    App --> Repository
    App --> UuidGen
    Router --> Controller

    Controller --> UseCaseInterface
    Controller --> RequestDTO
    Controller --> ResponseDTO

    UseCase -.implements.-> UseCaseInterface
    UseCase --> RepoInterface
    UseCase --> IdGenInterface
    UseCase --> Entity
    UseCase --> RequestDTO
    UseCase --> ResponseDTO

    Repository -.implements.-> RepoInterface
    Repository --> Entity
    UuidGen -.implements.-> IdGenInterface

    %% スタイル
    classDef domain fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    classDef application fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef adapter fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef infrastructure fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px

    class Entity,RepoInterface,IdGenInterface domain
    class UseCase,UseCaseInterface,RequestDTO,ResponseDTO application
    class Controller,Repository,UuidGen adapter
    class App,Router infrastructure
```

## 依存関係の原則

クリーンアーキテクチャでは、**依存の方向は外側から内側へのみ**という重要な原則があります。

```mermaid
graph LR
    Infrastructure["Infrastructure Layer"] -->|依存| Adapter["Adapter Layer"]
    Adapter -->|依存| Application["Application Layer"]
    Application -->|依存| Domain["Domain Layer"]
    Domain -.->|依存しない| X[ ]

    style Domain fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    style Application fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style Adapter fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style Infrastructure fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    style X fill:none,stroke:none
```

## 各層の責務と依存関係

### 1. Domain層（最内層）

**責務**: ビジネスロジックの核心。フレームワークやライブラリに依存しない純粋なビジネスルール。

```mermaid
classDiagram
    class Book {
        -_id: string
        -_title: string
        -_isAvailable: boolean
        -_createdAt: Date
        -_updatedAt: Date
        +loan() void
        +return() void
    }

    class BookRepositoryInterface {
        <<interface>>
        +create(book: Book) Promise~Book~
    }

    class IdGeneratorInterface {
        <<interface>>
        +generate() string
    }

    note for Book "エンティティ\nビジネスルールを持つ"
    note for BookRepositoryInterface "リポジトリの抽象\n具体的な実装は外層"
    note for IdGeneratorInterface "ID生成の抽象\n具体的な実装は外層"
```

**ファイル構成**:

- `apps/api/src/domain/entities/book.ts`
- `apps/api/src/domain/repositories/bookRepositoryInterface.ts`
- `apps/api/src/domain/utils/idGeneratorInterface.ts`

**依存先**: なし（他の層に依存しない）

### 2. Application層（ユースケース層）

**責務**: アプリケーション固有のビジネスルール。ユースケースの実装とデータ変換（DTO）。

```mermaid
classDiagram
    class AddBookUseCase {
        -bookRepository: BookRepositoryInterface
        -idGenerator: IdGeneratorInterface
        +execute(requestDto) Promise~AddBookResponseDto~
    }

    class AddBookUseCaseInterface {
        <<interface>>
        +execute(requestDto) Promise~AddBookResponseDto~
    }

    class AddBookRequestDto {
        +title: string
    }

    class AddBookResponseDto {
        +id: string
        +title: string
        +isAvailable: boolean
        +createdAt: Date
        +updatedAt: Date
    }

    AddBookUseCase ..|> AddBookUseCaseInterface
    AddBookUseCase ..> AddBookRequestDto
    AddBookUseCase ..> AddBookResponseDto

    note for AddBookUseCase "Domain層のインターフェースに依存\n具体実装には依存しない"
```

**ファイル構成**:

- `apps/api/src/application/usecases/book/addBookUseCase.ts`
- `apps/api/src/application/usecases/book/addBookUseCaseInterface.ts`
- `apps/api/src/application/dtos/book/addBookRequestDto.ts`
- `apps/api/src/application/dtos/book/addBookResponseDto.ts`

**依存先**: Domain層のみ（Entity, Interface）

**処理フロー**:

```mermaid
sequenceDiagram
    participant UC as AddBookUseCase
    participant IDGen as IdGeneratorInterface
    participant Entity as Book
    participant Repo as BookRepositoryInterface

    UC->>IDGen: generate()
    IDGen-->>UC: id
    UC->>Entity: new Book(id, title)
    Entity-->>UC: book instance
    UC->>Repo: create(book)
    Repo-->>UC: created book
    UC-->>UC: convert to ResponseDto
```

### 3. Adapter層（インターフェースアダプター層）

**責務**: 外部とDomain/Application層の間のデータ変換。具体的な実装を提供。

```mermaid
classDiagram
    class BookController {
        -addBookUseCase: AddBookUseCaseInterface
        +add(req, res) Promise~void~
    }

    class PrismaBookRepository {
        -prisma: PrismaClient
        +create(book: Book) Promise~Book~
    }

    class UuidGenerator {
        +generate() string
    }

    class BookRepositoryInterface {
        <<interface>>
    }

    class IdGeneratorInterface {
        <<interface>>
    }

    PrismaBookRepository ..|> BookRepositoryInterface
    UuidGenerator ..|> IdGeneratorInterface

    note for BookController "Express Request/Responseを\nDTOに変換"
    note for PrismaBookRepository "Prismaを使った\nリポジトリの具体実装"
    note for UuidGenerator "uuidライブラリを使った\nID生成の具体実装"
```

**ファイル構成**:

- `apps/api/src/adapter/controllers/bookController.ts`
- `apps/api/src/adapter/repositories/prismaBookRepository.ts`
- `apps/api/src/adapter/utils/uuidGenerator.ts`

**依存先**: Domain層、Application層

**BookControllerの処理フロー**:

```mermaid
sequenceDiagram
    participant HTTP as Express Request
    participant Ctrl as BookController
    participant DTO as RequestDto
    participant UC as AddBookUseCase

    HTTP->>Ctrl: POST /book {title}
    Ctrl->>DTO: create RequestDto
    Ctrl->>UC: execute(requestDto)
    UC-->>Ctrl: ResponseDto
    Ctrl-->>HTTP: 202 JSON response
```

### 4. Infrastructure層（外部フレームワーク層）

**責務**: フレームワーク設定、依存性注入、アプリケーション起動。

```mermaid
graph TB
    subgraph "app.ts - 依存性注入コンテナ"
        A[PrismaClient生成]
        B[UuidGenerator生成]
        C[PrismaBookRepository生成]
        D[AddBookUseCase生成]
        E[BookController生成]
        F[Express Routerに登録]
    end

    A --> C
    B --> D
    C --> D
    D --> E
    E --> F

    style A fill:#e8f5e9
    style B fill:#e8f5e9
    style C fill:#f3e5f5
    style D fill:#fff9c4
    style E fill:#f3e5f5
    style F fill:#e8f5e9
```

**ファイル構成**:

- `apps/api/src/infrastructure/web/app.ts`
- `apps/api/src/infrastructure/web/routers/bookRouter.ts`

**依存先**: すべての層（すべてを組み立てる）

**app.tsでの依存性注入**:

```typescript
// 外側から内側へ、順番にインスタンスを生成

// 1. 最も外側の具体実装（Adapter層）
const prisma = new PrismaClient();
const uuidGenerator = new UuidGenerator();

// 2. リポジトリ実装（Adapter層）
const bookRepository = new PrismaBookRepository(prisma);

// 3. ユースケース（Application層）- インターフェースに依存
const addBookUseCase = new AddBookUseCase(bookRepository, uuidGenerator);

// 4. コントローラー（Adapter層）- ユースケースインターフェースに依存
const bookController = new BookController(addBookUseCase);

// 5. ルーターに登録（Infrastructure層）
app.use("/book", bookRoutes(bookController));
```

## リクエストの流れ（全体シーケンス図）

```mermaid
sequenceDiagram
    autonumber
    participant Client as クライアント
    participant Router as bookRouter
    participant Ctrl as BookController
    participant UC as AddBookUseCase
    participant IDGen as UuidGenerator
    participant Entity as Book
    participant Repo as PrismaBookRepository
    participant DB as Database

    Client->>Router: POST /book {"title": "..."}
    Router->>Ctrl: add(req, res)

    Note over Ctrl: HTTPリクエストをDTOに変換
    Ctrl->>UC: execute(requestDto)

    Note over UC: ビジネスロジック実行
    UC->>IDGen: generate()
    IDGen-->>UC: uuid

    UC->>Entity: new Book(id, title)
    Entity-->>UC: book instance

    UC->>Repo: create(book)
    Note over Repo: Entityをデータベース形式に変換
    Repo->>DB: INSERT
    DB-->>Repo: created record
    Note over Repo: レコードをEntityに変換
    Repo-->>UC: Book entity

    Note over UC: EntityをResponseDtoに変換
    UC-->>Ctrl: ResponseDto

    Note over Ctrl: DtoをJSON Responseに変換
    Ctrl-->>Router: 202 response
    Router-->>Client: {"id": "...", "title": "..."}
```

## 依存性逆転の原則（DIP）の実現

クリーンアーキテクチャの核心は**依存性逆転の原則**です。

```mermaid
graph TB
    subgraph "従来の依存関係 ❌"
        direction TB
        A1[UseCase] -->|直接依存| B1[PrismaRepository]
        B1 -->|直接依存| C1[Prisma]
    end

    subgraph "依存性逆転後 ✅"
        direction TB
        A2[AddBookUseCase] -->|依存| I2[BookRepositoryInterface]
        P2[PrismaBookRepository] -.implements.-> I2
        P2 -->|依存| C2[Prisma]
    end

    style A1 fill:#ffcdd2
    style B1 fill:#ffcdd2
    style A2 fill:#c8e6c9
    style I2 fill:#c8e6c9
    style P2 fill:#c8e6c9
```

**メリット**:

1. **テスト容易性**: モックやスタブを使った単体テストが簡単
2. **変更容易性**: Prismaを別のORMに変更しても、ユースケースは影響を受けない
3. **ビジネスロジックの保護**: フレームワークや技術的詳細がビジネスロジックに侵入しない

**具体例**:

`AddBookUseCase`は`BookRepositoryInterface`に依存:

```typescript
export class AddBookUseCase {
  constructor(
    private readonly bookRepository: BookRepositoryInterface, // インターフェース
    private readonly idGenerator: IdGeneratorInterface, // インターフェース
  ) {}
}
```

実際の実装は`app.ts`で注入:

```typescript
const bookRepository = new PrismaBookRepository(prisma); // 具体実装
const uuidGenerator = new UuidGenerator(); // 具体実装
const addBookUseCase = new AddBookUseCase(bookRepository, uuidGenerator);
```

## 各層の変更の影響範囲

```mermaid
graph TD
    D[Domain層の変更] -->|影響| AP[Application層]
    D -->|影響| AD[Adapter層]
    D -->|影響| I[Infrastructure層]

    AP[Application層の変更] -->|影響| AD2[Adapter層]
    AP -->|影響| I2[Infrastructure層]

    AD3[Adapter層の変更] -->|影響| I3[Infrastructure層]

    I4[Infrastructure層の変更] -.->|影響なし| X[ ]

    style D fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    style AP fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style AD fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style I fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    style AD2 fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style I2 fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    style AD3 fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style I3 fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    style I4 fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    style X fill:none,stroke:none
```

- **Domain層の変更**: すべての層に影響（最も慎重に設計すべき）
- **Application層の変更**: Adapter層とInfrastructure層に影響
- **Adapter層の変更**: Infrastructure層のみに影響
- **Infrastructure層の変更**: 他の層に影響なし（最も変更しやすい）

## まとめ

### クリーンアーキテクチャの利点

1. **フレームワーク非依存**: Expressを別のフレームワークに変更可能
2. **データベース非依存**: Prismaを別のORMやRaw SQLに変更可能
3. **UI非依存**: REST APIをGraphQLに変更可能
4. **テスト可能**: ビジネスルールを外部要素なしでテスト可能
5. **外部依存の遅延決定**: ビジネスロジックを先に設計し、技術選定を後回しにできる

### ディレクトリ構成と層の対応

```text
apps/api/src/
├── domain/              # Domain層（最内層）
│   ├── entities/        # エンティティ
│   ├── repositories/    # リポジトリインターフェース
│   └── utils/           # ドメインユーティリティインターフェース
│
├── application/         # Application層
│   ├── usecases/        # ユースケース実装
│   └── dtos/            # データ転送オブジェクト
│
├── adapter/             # Adapter層
│   ├── controllers/     # HTTPコントローラー
│   ├── repositories/    # リポジトリ実装
│   └── utils/           # ユーティリティ実装
│
└── infrastructure/      # Infrastructure層（最外層）
    └── web/
        ├── app.ts       # 依存性注入・起動
        └── routers/     # ルーティング
```

### 依存関係のチェックポイント

- [ ] Domain層は他の層をimportしていないか？
- [ ] Application層はDomain層のみをimportしているか？
- [ ] Adapter層は具象クラスではなくインターフェースに依存しているか？
- [ ] Infrastructure層で依存性注入が正しく行われているか？
