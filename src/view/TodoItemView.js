/**
 * TodoItemViewクラス - Reactの個別コンポーネントと仮想DOM要素の生成
 *
 * このクラスは、Reactの以下の概念を純粋なJavaScriptで実装しています：
 * 1. 関数コンポーネント（またはクラスコンポーネント）
 * 2. 条件付きレンダリング（completedの状態による表示切り替え）
 * 3. イベントハンドリング（Synthetic Events相当）
 * 4. 仮想DOM要素の生成
 *
 * Reactの仮想DOM要素生成:
 * JSX → React.createElement() → ReactElement（仮想DOMオブジェクト）
 *
 * このクラスが実装する仮想DOMの特徴:
 * - 宣言的UI: データの状態に基づいてUIを記述
 * - イベントデリゲーション: イベントハンドラーの効率的な管理
 * - コンポーネントの再利用性: 独立した部品として機能
 *
 * 本来のReactコンポーネント:
 * ```jsx
 * function TodoItem({ todoItem, onUpdateTodo, onDeleteTodo }) {
 *   return (
 *     <li>
 *       <input
 *         type="checkbox"
 *         checked={todoItem.completed}
 *         onChange={() => onUpdateTodo({
 *           id: todoItem.id,
 *           completed: !todoItem.completed
 *         })}
 *       />
 *       {todoItem.completed
 *         ? <s>{todoItem.title}</s>
 *         : todoItem.title}
 *       <button onClick={() => onDeleteTodo({ id: todoItem.id })}>
 *         x
 *       </button>
 *     </li>
 *   );
 * }
 * ```
 *
 * Reactの最適化テクニック（本来は実装されるべきもの）:
 * - React.memo: 不要な再レンダリングの防止
 * - useCallback: イベントハンドラーのメモ化
 * - key属性: リスト内での効率的な差分検出
 */
import { element } from "./html-util.js";

export class TodoItemView {
    /**
     * 仮想DOM要素の生成 - React.createElement()とrenderメソッドの実装
     *
     * このメソッドはReactの以下の機能を実装しています：
     *
     * 1. 条件付きレンダリング：
     *    - completedの状態に応じて異なる要素を生成
     *    - Reactの三項演算子や&&演算子を使った条件分岐に相当
     *
     * 2. イベントハンドリング：
     *    - addEventListener = ReactのonChange、onClickイベント
     *    - イベントが発生するとActionのdispatchが実行される
     *
     * 3. データフローの実装：
     *    - UIイベント → Action dispatch (onUpdateTodo/onDeleteTodo)
     *    - → Reducer処理 → State更新 → UI再レンダリング
     *
     * ReactのSynthetic Eventsとの違い：
     * - React: イベントデリゲーションでルート要素にイベントを集約
     * - このコード: 各要素に直接イベントリスナーを追加
     *
     * @param {TodoItemModel} todoItem Stateから取得したデータ（props）
     * @param {function} onUpdateTodo UPDATE_TODO Actionをdispatchする関数
     * @param {function} onDeleteTodo DELETE_TODO Actionをdispatchする関数
     * @returns {Element} 生成された仮想DOM要素（実際はDOM要素）
     */
    createElement(todoItem, { onUpdateTodo, onDeleteTodo }) {
        const todoItemElement = todoItem.completed
            ? element`<li><input type="checkbox" class="checkbox" checked>
                                    <s>${todoItem.title}</s>
                                    <button class="delete">x</button>
                                </li>`
            : element`<li><input type="checkbox" class="checkbox">
                                    ${todoItem.title}
                                    <button class="delete">x</button>
                                </li>`;
        const inputCheckboxElement = todoItemElement.querySelector(".checkbox");
        inputCheckboxElement.addEventListener("change", () => {
            // ReduxのAction dispatchに相当 - UPDATE_TODO Actionを発行
            // ReactではonChange={() => dispatch(updateTodo(...))} に相当
            onUpdateTodo({
                id: todoItem.id,
                completed: !todoItem.completed
            });
        });
        const deleteButtonElement = todoItemElement.querySelector(".delete");
        deleteButtonElement.addEventListener("click", () => {
            // ReduxのAction dispatchに相当 - DELETE_TODO Actionを発行
            // ReactではonClick={() => dispatch(deleteTodo(...))} に相当
            onDeleteTodo({
                id: todoItem.id
            });
        });
        // 作成したTodoアイテムのHTML要素を返す
        return todoItemElement;
    }
}
