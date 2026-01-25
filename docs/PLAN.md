# typescript-example-01 学習プラン（TODOアプリ実践）

## 前提
- 学習は「動くTODOアプリを段階的に育てる」形式で進める
- 1フェーズごとに「動くもの」を必ず作る
- バックエンド（写経）は `backend/` に置く（内部の `src/` 構造は維持）
- バックエンド（参照）は `examples/backend/` に置く（内部の `src/` 構造は維持）
- フロントエンド（写経）は `frontend/` に置く
- フロントエンド（参照）は `examples/frontend/` に置く
- コメントは日本語で書く
- テスト名は日本語で書く
- 変更ごとに動作確認を行う

## ファイル命名/配置のルール

- `examples/` 配下に新しくファイルを追加したら、対応する空ファイルを写経側にも作る
- typeは「そのファイルだけで使うなら同一ファイル、複数箇所で使うなら `types/` に置く」
- Reactコンポーネントは `PascalCase.tsx`（例: `TodoApp.tsx`）
- hooksは `useXxx.ts`（例: `useAuth.ts`）
- storeは `camelCase.ts`（例: `todoFilter.ts`）
- typesは `lowercase.ts`（例: `auth.ts`, `todo.ts`）
- backendのエントリは `index.ts`、HTTPサーバは `server.ts`
- テストは `*.test.ts` で配置する

---

## 学習ゴール
- TypeScriptの型安全な設計ができる
- Node.jsでCLI/HTTP APIを実装できる
- ReactでTODOアプリのUIを作れる
- テスト/品質管理/運用の流れを体験できる

---

## 全体構成（TODOアプリの成長）

1. **CLI版TODO**（ファイル保存）
2. **API版TODO**（HTTP + 永続化）
3. **Web版TODO**（React UI）
4. **品質強化**（テスト/CI）

---

## フェーズ別プラン

### Phase 1: CLI TODO（Week 1）

#### 目標
ターミナルで動くTODOを作り、TypeScriptの型と基本構文に慣れる

#### 実装内容
- [x] 追加（add）
- [x] 一覧（list）
- [x] 完了（done）
- [x] 削除（remove）
- [x] 全削除（clear）
- [x] JSONファイル保存（data/todos.json）

#### 学ぶこと
- 基本型（string/number/boolean/union）
- オブジェクト型の定義
- 配列操作（map/filter/find）
- ファイルI/O（fs/promises）

#### 成果物
- `backend/src/index.ts`（CLI TODOアプリ）
- 実行例: `npm run dev -- backend/src/index.ts add "Buy milk"`

---

### Phase 2: CLI TODO拡張（Week 2）

#### 目標
実用に近づける

#### 実装内容
- [x] editコマンド追加
- [x] toggle（done/undone）
- [x] listの表示改善（createdAt表示）
- [x] コマンドのエラーメッセージ改善

#### 学ぶこと
- 型ガード
- as const
- エラーハンドリング

#### 成果物
- CLI TODOの操作性向上

---

### Phase 3: API TODO（Week 3-4）

#### 目標
HTTP APIとしてTODO操作できるようにする

#### 技術選定
- Fastify
- Zod
- Vitest + Supertest

#### 実装内容
- [x] GET /todos
- [x] POST /todos
- [x] PUT /todos/:id
- [x] DELETE /todos/:id
- [x] バリデーション
- [x] エラーハンドリング

#### 学ぶこと
- リクエスト/レスポンス型
- バリデーション
- テストの書き方

#### 成果物
- APIサーバ
- APIテスト

---

### Phase 4: DB導入（Week 5-6）

#### 目標
DBでデータを永続化する

#### 技術選定
- PostgreSQL
- Prisma

#### 実装内容
- [x] Prismaセットアップ
- [x] User / Todoスキーマ
- [x] CRUD APIをDB対応

#### 学ぶこと
- DB設計
- マイグレーション
- ORM操作

#### 成果物
- DB永続化API

---

### Phase 5: Web TODO（Week 7-8）

#### 目標
UIを作って実際に操作できるようにする

#### 技術選定
- React + Vite
- Zustand
- TanStack Query

#### 実装内容
- [x] サインアップ/ログイン APIの実装
- [x] ログイン画面
- [x] TODO一覧/追加/編集/削除
- [x] 認証トークン付きでのAPI呼び出し

#### 認証API仕様（確定）
- エンドポイント: `POST /auth/signup`, `POST /auth/login`
- レスポンス: `{ token, user: { id, email } }`
- バリデーション: emailは `email` 形式、passwordは `min 8`
- エラー: 400（Invalid body）、401（Invalid credentials）、409（Email already registered）
- JWT期限: `7d`
- `/todos` は `Authorization: Bearer <token>` 必須
- `/todos` 未認証は `401` + `{ message: "Unauthorized." }`
- 認証OKでも他人のTodoは `404`（存在を隠す）

#### 学ぶこと
- Reactコンポーネント
- 状態管理
- API連携

#### 成果物
- Web TODOアプリ

---

### Phase 6: レイヤード整理（Week 9）

#### 目標
server.tsの責務を分離し、Domain設計で理解を深める

#### レイヤードの役割
- Handler: HTTPの入出力とバリデーションを担当し、UseCaseを呼ぶ
- UseCase: アプリの操作単位（ユーザーの行為）を表し、Serviceを組み合わせる
- Service: ビジネスロジックや外部連携の実装を担当する
- Repository: 永続化の具体実装を担当する

## レイヤードの役割について補足
- UseCaseは「ユーザーの行為の単位」を明確にして、UI/APIから独立させるため。
- Serviceは「その行為を成立させる実装手段」をまとめて、外部依存や複雑さを隠すため。
- UseCaseを分けるメリットは、
  - 行為単位の入口が明確になる
  - Serviceは「手段の部品」に寄せられる
  - テストを行為単位で書きやすい

#### ドメイン層（ドメイン知識の表現）の役割
- Entity: IDで同一性を持つモデル。状態と振る舞い（ルール）を持つ
- ValueObject: 値に意味と制約を持つ不変オブジェクト。値が同じなら同じと扱う

#### 実装内容
- [X] Domain（Entity / ValueObject）を定義する
- [X] Handler/Service/Repositoryに分割
- [X] 依存の向きを整理（Handler -> UseCase -> Service -> Repository）
- [X] 例外/エラーの責務分離
- [X] Domainエラー（ビジネスルール違反）を定義する

#### Domain設計案
- Entity: User, Todo
- ValueObject: Email, TodoTitle, TodoStatus

#### UseCase設計案（アプリケーション層）
- SignUpUser
- LoginUser
- CreateTodo
- ListTodos
- UpdateTodo
- DeleteTodo

#### ディレクトリ構成案
```
backend/src/
  handlers/
    authHandler.ts
    todoHandler.ts
  usecases/
    auth/
      signUpUser.ts
      loginUser.ts
    todos/
      createTodo.ts
      listTodos.ts
      updateTodo.ts
      deleteTodo.ts
  domain/
    entities/
      user.ts
      todo.ts
    valueObjects/
      email.ts
      todoTitle.ts
      todoStatus.ts
    errors/
      domainError.ts
  services/
    authService.ts
    todoService.ts
  repositories/
    userRepository.ts
    todoRepository.ts
  infrastructure/
    prismaClient.ts
  server.ts
  index.ts
```

#### 成果物
- Domain込みのレイヤード構成に整理されたAPI実装

---

### Phase 7: 品質強化（Week 10）

#### 目標
テスト・CIなど実務的な運用を学ぶ

#### 実装内容
- [X] テスト実行の分離を運用化（package.jsonにスクリプト追加）
- [X] Lint（ESLint）
- [X] Format（Prettier）
- [X] バックエンド: ユニットテスト
- [X] バックエンド: API結合テスト（Vitest + Supertest）
- [X] フロントエンド: ユニットテスト
- [X] バックエンド: カバレッジ
- [X] フロントエンド: カバレッジ
- [ ] フロントエンド: E2Eテスト（Playwright）
- [ ] バックエンド: CI（GitHub Actions）
  - typecheck + test + build を実行して「型が通る / テストが通る / ビルドできる」を保証する
  - テストDBを起動してからテストを実行する
- [ ] フロントエンド: CI（GitHub Actions）
  - typecheck + test + build を実行して「型が通る / テストが通る / ビルドできる」を保証する

#### ユニットテスト範囲
- Domain（Entity / ValueObject / DomainError）
- UseCase（入力→出力のルール）
- Service/Repositoryのテスト戦略（モック/実DB）

#### エンドポイント / UseCase のテスト方針
- 全エンドポイントで正常系/異常系を網羅する
- UseCaseはユーザー操作を網羅する前提で、入力→出力の仕様テストを優先する

#### カバレッジの位置づけ
- カバレッジは主指標ではなく補助指標として扱う
- 網羅が必要な領域では、抜け漏れ防止のガードレールとして使う
- 網羅が必要な領域: エンドポイント / UseCase / Domain
- まず「網羅すべき仕様」を決める（例: /auth/signup は 201 / 409 / 400 を網羅）
- そのテストがコード上の分岐を通っているかをカバレッジで確認する
- 未到達の分岐があれば、仕様テストの抜け漏れとして見直す

#### Service/Repositoryのテスト方針
- Repositoryは「メソッドごとの仕様」を先に書き、仕様が書けるものだけテストする
- Serviceは「仕様のない処理はテストしない」。分岐/変換/状態遷移があるものはテストする

#### 成果物
- 品質管理パイプライン

---

## ディレクトリ運用ルール

- AIが出す参照コード: `examples/backend/`, `examples/frontend/`
- 自分で写経するコード: `backend/`, `frontend/`
- フェーズごとの分割は行わない

---

## 実行コマンド（共通）

- 実行: `npm run dev -- <file>`
- 型チェック: `npm run check`

---

最終更新: 2026-01-23
ステータス: Phase 6 完了
