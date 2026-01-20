# typescript-example-01 学習プラン（TODOアプリ実践）

## 前提
- 学習は「動くTODOアプリを段階的に育てる」形式で進める
- 自分が写経するコードは `src/` に置く
- AIが作る参照コードは `examples/` に置く
- 1フェーズごとに「動くもの」を必ず作る
- コメントは日本語で書く
- 変更ごとに動作確認を行う

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
- `src/index.ts`（CLI TODOアプリ）
- 実行例: `npm run dev -- src/index.ts add "Buy milk"`

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
- [ ] サインアップ/ログイン APIの実装
- [ ] ログイン画面
- [ ] TODO一覧/追加/編集/削除
- [ ] 認証トークン付きでのAPI呼び出し

#### 学ぶこと
- Reactコンポーネント
- 状態管理
- API連携

#### 成果物
- Web TODOアプリ

---

### Phase 6: レイヤード整理（Week 9）

#### 目標
server.tsの責務を分離して学習しやすい構成にする

#### 実装内容
- [ ] Handler/Service/Repositoryに分割
- [ ] 依存の向きを整理（Handler -> Service -> Repository）
- [ ] 例外/エラーの責務分離

#### 成果物
- レイヤード構成に整理されたAPI実装

---

### Phase 7: 品質強化（Week 10）

#### 目標
テスト・CIなど実務的な運用を学ぶ

#### 実装内容
- [ ] ユニットテスト
- [ ] E2Eテスト（Playwright）
- [ ] CI（GitHub Actions）

#### 成果物
- 品質管理パイプライン

---

## ディレクトリ運用ルール

- AIが出す参照コード: `examples/`
- 自分で写経するコード: `src/`
- フェーズごとにサブディレクトリを作ってもOK
  - 例: `examples/phase-01/`, `src/phase-01/`

---

## 実行コマンド（共通）

- 実行: `npm run dev -- <file>`
- 型チェック: `npm run check`

---

最終更新: 2026-01-12
ステータス: Phase 4 完了
