/**
 * TodoListViewクラス - Reactの仮想DOMコンポーネント
 *
 * このクラスは、Reactの関数コンポーネントとReact.createElement()の
 * 仕組みを純粋なJavaScriptで実装したものです。
 *
 * Reactの仮想DOM生成プロセス:
 * 1. JSX記法 → React.createElement()へのトランスパイル
 * 2. React.createElement()が仮想DOMオブジェクト（ReactElement）を生成
 * 3. 仮想DOMツリーの構築
 * 4. Reconciliation（差分検出）処理
 * 5. 実際のDOM更新（最小限の変更）
 *
 * このクラスの役割:
 * - StateからViewへの変換（データ → 仮想DOM）
 * - 子コンポーネントの組み立て（コンポーネントツリーの構築）
 * - イベントハンドラーのバインディング
 *
 * 本来のReactでは:
 * ```jsx
 * function TodoList({ todoItems, onUpdateTodo, onDeleteTodo }) {
 *   return (
 *     <ul>
 *       {todoItems.map(item =>
 *         <TodoItem key={item.id} {...item}
 *           onUpdate={onUpdateTodo}
 *           onDelete={onDeleteTodo} />
 *       )}
 *     </ul>
 *   );
 * }
 * ```
 * このようなJSXコードが、以下のcreateElementメソッドと同等の処理を行います。
 */
import { element } from "./html-util.js";
import { TodoItemView } from "./TodoItemView.js";

export class TodoListView {
    /**
     * 仮想DOM生成メソッド - React.createElement()とrenderメソッドに相当
     *
     * このメソッドは、Reactにおける以下の処理を実装しています：
     * 1. props（todoItems, イベントハンドラー）を受け取る
     * 2. 仮想DOMツリーを構築（React.createElement相当）
     * 3. 子コンポーネントを再帰的に生成（コンポーネントの合成）
     *
     * Reactの仮想DOMとの違い:
     * - React: 仮想DOMオブジェクト → 差分検出 → 実DOM更新
     * - このコード: 直接実DOMを生成（簡略化のため）
     *
     * 本来のReactでは、このメソッドは以下のように最適化されます：
     * - key属性による効率的な差分検出
     * - shouldComponentUpdateによる不要な再レンダリング防止
     * - React.memoによるコンポーネントのメモ化
     *
     * @param {TodoItemModel[]} todoItems Stateから取得したデータ（props）
     * @param {function} onUpdateTodo Actionをdispatchするコールバック
     * @param {function} onDeleteTodo Actionをdispatchするコールバック
     * @returns {Element} 生成された仮想DOM（実際はDOM要素）
     */
    createElement(todoItems, { onUpdateTodo, onDeleteTodo }) {
        const todoListElement = element`<ul></ul>`;
        // 各TodoItemモデルに対応したHTML要素を作成し、リスト要素へ追加する
        todoItems.forEach(todoItem => {
            const todoItemView = new TodoItemView();
            const todoItemElement = todoItemView.createElement(todoItem, {
                onDeleteTodo,
                onUpdateTodo
            });
            todoListElement.appendChild(todoItemElement);
        });
        return todoListElement;
    }
}
