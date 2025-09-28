/**
 * TodoListModelクラス - ReduxのStore + Reducerを統合した状態管理
 *
 * このクラスは、Reduxにおける以下の要素を1つにまとめています：
 * 1. Store: アプリケーション全体の状態（State）を保持する唯一の場所
 * 2. Reducer: Actionを受け取ってStateを更新する純粋関数の役割
 * 3. Container Component: 状態を管理し、子コンポーネントに配布する親コンポーネント
 *
 * ReduxのStore構造:
 * - #items: アプリケーションのState（Todoリストの状態）
 * - EventEmitter継承: dispatch/subscribeメカニズムの実装
 *
 * Reducerの機能:
 * - addTodo(): ADD_TODO actionに相当
 * - updateTodo(): UPDATE_TODO actionに相当
 * - deleteTodo(): DELETE_TODO actionに相当
 *
 * データフローの実装:
 * 1. UI操作（ボタンクリックなど）
 * 2. メソッド呼び出し（addTodo等 = Action dispatch）
 * 3. State（#items）の更新（Reducer処理）
 * 4. emitChange()でイベント発火（Store通知）
 * 5. 登録されたリスナーが実行（View再レンダリング）
 *
 * このパターンにより、Reduxの単方向データフローが実現されています。
 */

import { EventEmitter } from "../EventEmitter.js";

export class TodoListModel extends EventEmitter {
    #items;
    /**
     * @param {TodoItemModel[]} [items] 初期アイテム一覧（デフォルトは空の配列）
     */
    constructor(items = []) {
        super();
        this.#items = items;
    }

    /**
     * TodoItemの合計個数を返す
     * @returns {number}
     */
    getTotalCount() {
        return this.#items.length;
    }

    /**
     * 表示できるTodoItemの配列を返す
     * @returns {TodoItemModel[]}
     */
    getTodoItems() {
        return this.#items;
    }

    /**
     * State変更リスナーの登録 - ReduxのStore.subscribe()に相当
     *
     * ViewコンポーネントがStateの変更を監視し、
     * 変更時に再レンダリングを行うためのメカニズム。
     * React-Reduxのconnect関数の内部でも同様の処理が行われています。
     *
     * @param {Function} listener State変更時に実行される関数
     */
    onChange(listener) {
        this.addEventListener("change", listener);
    }

    /**
     * `onChange`で登録したリスナー関数を解除する
     * @param {Function} listener
     */
    offChange(listener) {
        this.removeEventListener("change", listener);
    }

    /**
     * State変更の通知 - ReduxのStore変更通知に相当
     *
     * ReducerでStateが更新された後、すべてのサブスクライバーに
     * 変更を通知します。これによりViewの再レンダリングがトリガーされ、
     * UIが最新のStateを反映した状態に更新されます。
     */
    emitChange() {
        this.emit("change");
    }

    /**
     * Todo追加処理 - ReduxのADD_TODO Action処理に相当
     *
     * Reducerのcase 'ADD_TODO':に相当する処理。
     * 新しいTodoをStateに追加し、変更を通知します。
     * Reduxと同様に、Stateの不変性を保つために
     * 新しい配列を作成することが推奨されます。
     *
     * @param {TodoItemModel} todoItem 追加するTodoアイテム
     */
    addTodo(todoItem) {
        // タイトルが空のものは追加しない
        if (todoItem.isEmptyTitle()) {
            return;
        }
        this.#items.push(todoItem);
        this.emitChange();
    }

    /**
     * Todo更新処理 - ReduxのUPDATE_TODO Action処理に相当
     *
     * Reducerのcase 'UPDATE_TODO':に相当する処理。
     * Action payloadに含まれるidとcompletedの情報を基に
     * State内の該当するTodoを更新します。
     *
     * @param {{ id:number, completed: boolean }} Action payloadに相当するオブジェクト
     */
    updateTodo({ id, completed }) {
        const todoItem = this.#items.find(todo => todo.id === id);
        if (!todoItem) {
            return;
        }
        todoItem.completed = completed;
        this.emitChange();
    }

    /**
     * Todo削除処理 - ReduxのDELETE_TODO Action処理に相当
     *
     * Reducerのcase 'DELETE_TODO':に相当する処理。
     * filterメソッドを使って新しい配列を作成することで
     * Stateの不変性を保ちながら要素を削除します。
     *
     * @param {{ id: number }} Action payloadに相当する削除対象ID
     */
    deleteTodo({ id }) {
        // `id`に一致しないTodoItemだけを残すことで、`id`に一致するTodoItemを削除する
        this.#items = this.#items.filter(todo => {
            return todo.id !== id;
        });
        this.emitChange();
    }
}
