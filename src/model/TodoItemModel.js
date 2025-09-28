/**
 * TodoItemModelクラス - ReduxのState内の個別エンティティ
 *
 * このクラスは、ReduxのStateツリーの葉（リーフ）に相当します。
 * Reduxでは、正規化されたStateの設計において、
 * 各エンティティは独立したオブジェクトとして定義されます。
 *
 * Stateの構造例（Redux）:
 * {
 *   todos: {
 *     byId: {
 *       '1': { id: 1, title: 'Learn Redux', completed: false },
 *       '2': { id: 2, title: 'Build App', completed: true }
 *     },
 *     allIds: [1, 2]
 *   }
 * }
 *
 * TodoItemModelは上記のbyId内の個別オブジェクトに相当し、
 * 以下の特徴を持ちます：
 * - イミュータブル（不変）なデータ構造として扱われるべき
 * - 一意のID（プライマリーキー）を持つ
 * - ビジネスロジック（isEmptyTitle）を含む
 *
 * このパターンにより、StateのCRUD操作が効率的に行えます。
 */

// ユニークなIDを管理する変数（Reduxではuuidやnanoidがよく使われる）
let todoIdx = 0;

export class TodoItemModel {
    /** @type {number} TodoアイテムのID */
    id;
    /** @type {string} Todoアイテムのタイトル */
    title;
    /** @type {boolean} Todoアイテムが完了済みならばtrue、そうでない場合はfalse */
    completed;
    /**
     * コンストラクタ - ReduxのAction payloadからエンティティを生成
     *
     * Reduxで新しいTodoを追加する際、Actionのpayloadに含まれる
     * データを基にエンティティが作成されます。
     * IDの自動採番は、ReduxではミドルウェアやReducer内で行われます。
     *
     * @param {{ title: string, completed: boolean }} Action payloadに相当するデータ
     */
    constructor({ title, completed }) {
        // idは連番となり、それぞれのインスタンス毎に異なるものとする
        this.id = todoIdx++;
        this.title = title;
        this.completed = completed;
    }

    /**
     * バリデーションメソッド - ReduxのSelectorやAction Creator内のロジック
     *
     * Reduxでは、このようなビジネスロジックはSelector関数や
     * Action Creator内に実装されることが一般的です。
     * エンティティ自体がバリデーションロジックを持つことで、
     * データの整合性が保証されます。
     *
     * @returns {boolean} タイトルが空の場合true
     */
    isEmptyTitle() {
        return this.title.length === 0;
    }
}
