## 開発ルール

-   **コードの役割分担**:
    -   `examples/src`：私（AI）が作成する**お手本コード**を配置します。
    -   `src`：あなた（学習者）が、お手本を参考に**実際に書き写すコード**を配置します。
-   **実行対象**: `npm start` などのコマンドは、あなたが作成する `src` ディレクトリ内のコードを実行します。これにより、ご自身で書いたコードの動作確認ができます。

---

# TypeScript学習用CLI Todoアプリケーション開発プラン

## 1. 目的

Go言語のプロジェクト計画を参考に、TypeScriptの学習を主目的としたコマンドライン（CLI）Todo管理ツールを開発する。TypeScriptの基本的な型システムから、非同期処理、モジュール分割、簡単なテストまで、実践的なスキルを段階的に習得することを目指す。

## 2. 学習目標

-   **TypeScriptの基礎**: `string`, `number`, `boolean` などの基本の型、そして `Array`, `object` の使い方を理解する。
-   **カスタム型**: `interface` や `type` を用いて、アプリケーション独自の型（例: `Todo`型）を定義できる。
-   **コンパイラ設定**: `tsconfig.json` の役割を理解し、主要なオプション（`target`, `module`, `strict`, `outDir`など）を設定できる。
-   **Node.js環境**: `ts-node` を使ってTypeScriptコードを直接実行する方法や、`tsc`でJavaScriptにコンパイルする方法を学ぶ。
-   **CLI構築**: `commander` などのライブラリを使い、引数やオプションを持つ本格的なCLIコマンド（`add`, `list`など）を作成できる。
-   **非同期処理とファイル操作**: `async/await` を用いた非同期処理を理解し、`fs/promises` を使ってJSONファイルにデータを読み書きできる。
-   **モジュールシステム**: 機能ごとにファイルを分割し、`import`/`export` を使ってモジュールとして管理できる。
-   **コード品質**: `ESLint`（リンター）と `Prettier`（フォーマッター）を導入し、コードの品質と一貫性を保つ開発フローを体験する。
-   **テスト（発展）**: `Jest` や `Vitest` などのテストフレームワークを導入し、基本的なユニットテストを記述できる。

## 3. 機能要件

シンプルながらも実践的なCLIアプリケーションとして、以下の機能を持つものとする。

-   **Todoの追加 (`add <task>`)**: 新しいTodoタスクを追加する。
-   **Todoの一覧 (`list`)**: 現在のTodoタスクを一覧表示する。完了済みのタスクは分かるように表示する。
-   **Todoの完了 (`done <id>`)**: 指定したIDのTodoタスクを完了済みにする。
-   **Todoの削除 (`delete <id>`)**: 指定したIDのTodoタスクを削除する。

## 4. 開発ステップ

### ステップ1: プロジェクトの初期セットアップ

TypeScriptプロジェクトの土台を構築する。

1.  **npmプロジェクトの初期化**:
    ```bash
    npm init -y
    ```
2.  **`.gitignore`ファイルの作成**: `node_modules`やビルド成果物など、バージョン管理に不要なファイルを指定する。

3.  **必要なパッケージのインストール**:
    ```bash
    # TypeScript本体と、Node.jsの型定義ファイル
    npm install --save-dev typescript @types/node

    # TypeScriptを直接実行するためのts-node
    npm install --save-dev ts-node

    # CLIを簡単に構築するためのcommander
    npm install commander
    ```
4.  **TypeScript設定ファイルの作成**:
    -   **`tsconfig.json`**: あなたが`src`に書くコード用の設定ファイル。
        ```bash
        npx tsc --init
        ```
        -   `rootDir` は `"./src"` に設定。
    -   **`tsconfig.examples.json`**: 私（AI）が`examples/src`に書くお手本コード用の設定ファイル。
        -   `tsconfig.json`をコピーして作成。
        -   `rootDir` を `"./examples/src"` に、`outDir` を `"./dist-examples"` に変更。

5.  **`package.json`にスクリプトを追加**:
    開発を効率化するためのスクリプトを定義する。
    ```json
    "scripts": {
      "start": "ts-node src/index.ts",
      "start:example": "ts-node --project tsconfig.examples.json examples/src/index.ts",
      "build": "tsc",
      "build:example": "tsc --project tsconfig.examples.json",
      "test": "echo \"Error: no test specified\" && exit 1"
    }
    ```
6.  **ディレクトリ作成**:
    ```bash
    # あなたがコードを書くディレクトリ
    mkdir src

    # AIがお手本コードを書くディレクトリ
    mkdir -p examples/src
    ```

### ステップ2: 型定義とデータ永続化層の実装

アプリケーションで扱うデータ構造を定義し、それをファイルに保存・読み込みする仕組みを作る。

1.  **`examples/src/types.ts`の作成**: `Todo`タスクを表す`interface`を定義する。
    ```typescript
    export interface Todo {
      id: number;
      title: string;
      completed: boolean;
    }
    ```
    （あなたはこのファイルを参考に `src/types.ts` を作成します）

2.  **`examples/src/storage.ts`の作成**: TodoデータをJSONファイル(`todos.json`)に保存・読み込みする関数を実装する。
    -   `readTodos(): Promise<Todo[]>`
    -   `writeTodos(todos: Todo[]): Promise<void>`
    （あなたはこのファイルを参考に `src/storage.ts` を作成します）

### ステップ3: コマンドロジックとCLIエントリーポイントの実装

CLIの骨格を作り、各コマンドの処理を実装する。

1.  **`examples/src/commands.ts`の作成**: 各コマンドの具体的なロジックを実装する。
2.  **`examples/src/index.ts`の作成**: `commander` を使ってCLIの定義を行う。

### ステップ4: コード品質ツールの導入（リンターとフォーマッター）

開発体験を向上させ、コードの品質を保つためのツールを導入する。

1.  **ESLintとPrettierをインストール**:
    ```bash
    npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier
    ```
2.  **設定ファイルの作成**: `.eslintrc.js` と `.prettierrc.json` を作成する。
3.  **`package.json`にスクリプトを追加**:
    ```json
    "scripts": {
      // ... existing scripts
      "lint": "eslint . --ext .ts",
      "format": "prettier --write ."
    }
    ```

## 5. ディレクトリ構成（最終形）

```
typescript-example-01/
├── src/              # あなたが作成するコード
│   ├── index.ts
│   └── ...
├── examples/         # AIが作成するお手本コード
│   └── src/
│       ├── index.ts
│       └── ...
├── node_modules/
├── .gitignore
├── .eslintrc.js
├── .prettierrc.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.examples.json
└── todos.json        # Todoデータが保存されるファイル
```

## 6. 次のステップ（発展学習）

基本機能が完成したら、さらに以下の項目に挑戦することで、より深い学習につながる。

-   **テストの導入**: `Jest` や `Vitest` を使って、`commands.ts` や `storage.ts` のユニットテストを記述する。
-   **エラーハンドリングの強化**: ユーザーの入力ミス（例: 存在しないIDを指定）などを考慮し、分かりやすいエラーメッセージを出す。
-   **表示の改善**: `chalk` などのライブラリを使って、コンソールの出力に色を付け、見やすくする。
-   **対話的インターフェース**: `inquirer` などのライブラリを使い、ユーザーに質問を投げかけて操作を案内するモードを追加する。
