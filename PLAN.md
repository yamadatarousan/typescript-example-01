## 開発ルール

-   **コードの出力先**: これから作成するすべてのサンプルコードは、学習者が写経しやすいように `examples/` ディレクトリ配下に出力します。
-   **学習方法**: 学習者は `examples/` に出力されたコードを参考に、手で書き写す（写経する）形式で学習を進めます。

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
2.  **必要なパッケージのインストール**:
    ```bash
    # TypeScript本体と、Node.jsの型定義ファイル
    npm install --save-dev typescript @types/node

    # TypeScriptを直接実行するためのts-node
    npm install --save-dev ts-node

    # CLIを簡単に構築するためのcommander
    npm install commander
    ```
3.  **`tsconfig.json`の生成と設定**:
    ```bash
    npx tsc --init
    ```
    生成されたファイルに、以下の設定を推奨する。
    -   `"target": "ES2020"`
    -   `"module": "NodeNext"`
    -   `"moduleResolution": "NodeNext"`
    -   `"strict": true`
    -   `"outDir": "./dist"` (コンパイル後のJS出力先)
    -   `"rootDir": "./src"` (ソースコードの場所)
4.  **`package.json`にスクリプトを追加**:
    開発を効率化するためのスクリプトを定義する。
    ```json
    "scripts": {
      "start": "ts-node src/index.ts",
      "build": "tsc"
    }
    ```
5.  **ディレクトリ作成**:
    ```bash
    mkdir src
    ```

### ステップ2: 型定義とデータ永続化層の実装

アプリケーションで扱うデータ構造を定義し、それをファイルに保存・読み込みする仕組みを作る。

1.  **`src/types.ts`の作成**: `Todo`タスクを表す`interface`を定義する。
    ```typescript
    export interface Todo {
      id: number;
      title: string;
      completed: boolean;
    }
    ```
2.  **`src/storage.ts`の作成**: TodoデータをJSONファイル(`todos.json`)に保存・読み込みする関数を実装する。
    -   `readTodos(): Promise<Todo[]>`: JSONファイルを非同期で読み込み、`Todo`の配列を返す。ファイルが存在しない場合は空の配列を返す。
    -   `writeTodos(todos: Todo[]): Promise<void>`: `Todo`の配列を受け取り、JSONファイルに非同期で書き込む。
    -   ここでは `fs/promises` を使用して、`async/await` の良い練習とする。

### ステップ3: コマンドロジックとCLIエントリーポイントの実装

CLIの骨格を作り、各コマンドの処理を実装する。

1.  **`src/commands.ts`の作成**: 各コマンド（add, list, done, delete）の具体的なロジックを実装する関数を作成する。
    -   `addTodo(title: string)`
    -   `listTodos()`
    -   `completeTodo(id: number)`
    -   `removeTodo(id: number)`
    -   これらの関数は `storage.ts` の関数を呼び出して、データの読み書きを行う。
2.  **`src/index.ts`の作成**: `commander` を使ってCLIの定義を行う。
    -   プログラムのバージョンや説明を設定する。
    -   `add`, `list`, `done`, `delete` の各コマンドを定義する。
    -   各コマンドが実行されたときに、`commands.ts` で定義した対応する関数を呼び出すようにする。

### ステップ4: コード品質ツールの導入（リンターとフォーマッター）

開発体験を向上させ、コードの品質を保つためのツールを導入する。

1.  **ESLintとPrettierをインストール**:
    ```bash
    npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier
    ```
2.  **設定ファイルの作成**: `.eslintrc.js` と `.prettierrc.json` を作成し、基本的なルールを設定する。
3.  **`package.json`にスクリプトを追加**:
    ```json
    "scripts": {
      "lint": "eslint . --ext .ts",
      "format": "prettier --write ."
    }
    ```

## 5. ディレクトリ構成（最終形）

```
typescript-example-01/
├── examples/
│   └── src/
│       ├── index.ts      # CLIのエントリーポイント、commanderによるコマンド定義
│       ├── types.ts      # Todoインターフェースなどの型定義
│       ├── storage.ts    # ファイルI/O（データの永続化）
│       └── commands.ts   # 各コマンドの具体的な処理ロジック
├── node_modules/
├── .eslintrc.js      # ESLint設定ファイル
├── .prettierrc.json  # Prettier設定ファイル
├── package.json
├── package-lock.json
├── tsconfig.json
└── todos.json        # Todoデータが保存されるファイル
```

## 6. 次のステップ（発展学習）

基本機能が完成したら、さらに以下の項目に挑戦することで、より深い学習につながる。

-   **テストの導入**: `Jest` や `Vitest` を使って、`commands.ts` や `storage.ts` のユニットテストを記述する。
-   **エラーハンドリングの強化**: ユーザーの入力ミス（例: 存在しないIDを指定）などを考慮し、分かりやすいエラーメッセージを出す。
-   **表示の改善**: `chalk` などのライブラリを使って、コンソールの出力に色を付け、見やすくする。
-   **対話的インターフェース**: `inquirer` などのライブラリを使い、ユーザーに質問を投げかけて操作を案内するモードを追加する。
