/**
 * Appクラス - Reduxのデータフロー全体を管理するコントローラー
 *
 * このクラスは、ReduxとReactを組み合わせたアプリケーションの
 * ルートコンポーネント（App.js）に相当し、以下の役割を担います：
 *
 * Reduxのデータフロー全体：
 * 1. UI操作（ユーザー入力）
 *    - フォーム送信、チェックボックス、削除ボタン
 *
 * 2. Action Dispatch
 *    - #handleAdd → ADD_TODO Action
 *    - #handleUpdate → UPDATE_TODO Action
 *    - #handleDelete → DELETE_TODO Action
 *
 * 3. Store/Reducer（TodoListModel）
 *    - Actionを受け取り、Stateを更新
 *    - 新しいStateを生成（イミュータブル）
 *
 * 4. Store通知（EventEmitter）
 *    - emitChange()でState変更を通知
 *    - subscribeしているリスナーを実行
 *
 * 5. View更新（#handleChange）
 *    - 新しいStateを取得
 *    - 仮想DOMを再生成
 *    - 実DOMを更新（render関数）
 *
 * React-Reduxとの対応：
 * - App = connect()でラップされたコンテナコンポーネント
 * - #handleAdd/Update/Delete = mapDispatchToProps
 * - #handleChange = mapStateToPropsとcomponentDidUpdate
 * - mount/unmount = componentDidMount/componentWillUnmount
 *
 * このアーキテクチャにより実現される特徴：
 * - 単方向データフロー: UI → Action → State → UI
 * - 予測可能な状態管理: すべての変更がAction経由
 * - 関心の分離: Model/View/Controllerの明確な役割分担
 */

import { render } from "./view/html-util.js";
import { TodoListView } from "./view/TodoListView.js";
import { TodoItemModel } from "./model/TodoItemModel.js";
import { TodoListModel } from "./model/TodoListModel.js";

export class App {
    #todoListView = new TodoListView();
    #todoListModel = new TodoListModel([]);

    formElement;
    formInputElement;
    todoCountElement;
    todoListContainerElement;
    // 紐づけするHTML要素を引数として受け取る
    constructor({ formElement, formInputElement, todoListContainerElement, todoCountElement }) {
        this.formElement = formElement;
        this.formInputElement = formInputElement;
        this.todoCountElement = todoCountElement;
        this.todoListContainerElement = todoListContainerElement;
    }

    /**
     * Action Creator: ADD_TODO - Todo追加アクション
     *
     * ReduxのAction Creatorとdispatchを統合したメソッド。
     * React-Reduxでは、このような関数はmapDispatchToPropsで
     * コンポーネントに注入されます。
     *
     * Reduxの流れ:
     * 1. Actionオブジェクトの生成 (TodoItemModel)
     * 2. dispatch相当 (addTodoメソッド呼び出し)
     * 3. Reducer処理 (TodoListModel内部)
     * 4. State更新とView再レンダリング
     *
     * @param {string} title Todoアイテムのタイトル
     */
    #handleAdd = (title) => {
        this.#todoListModel.addTodo(new TodoItemModel({ title, completed: false }));
    };

    /**
     * Action Creator: UPDATE_TODO - Todo更新アクション
     *
     * チェックボックスの状態変更時にdispatchされるAction。
     * Reduxでは、このようなAction Creatorは通常
     * actions/todos.jsに定義されます。
     *
     * @param {{ id:number, completed: boolean }} Action payload
     */
    #handleUpdate = ({ id, completed }) => {
        this.#todoListModel.updateTodo({ id, completed });
    };

    /**
     * Action Creator: DELETE_TODO - Todo削除アクション
     *
     * 削除ボタンクリック時にdispatchされるAction。
     * Reduxのパターンでは、IDだけをpayloadに含む
     * シンプルなActionが一般的です。
     *
     * @param {{ id: number }} Action payload
     */
    #handleDelete = ({ id }) => {
        this.#todoListModel.deleteTodo({ id });
    };

    /**
     * UIイベントハンドラー - フォーム送信からAction dispatchへ
     *
     * ReactコンポーネントのonSubmitイベントハンドラーに相当。
     * ユーザーのUI操作をActionに変換し、
     * Reduxのデータフローを開始するトリガーとなります。
     *
     * @param {Event} event DOMイベントオブジェクト
     */
    #handleSubmit = (event) => {
        event.preventDefault();
        const inputElement = this.formInputElement;
        this.#handleAdd(inputElement.value);
        inputElement.value = "";
    };

    /**
     * Store変更リスナー - StateからViewへのレンダリング
     *
     * ReduxのStore.subscribe()で登録されるリスナー関数。
     * Stateが変更されるたびに実行され、以下の処理を行います：
     *
     * 1. 新しいStateを取得 (mapStateToProps相当)
     * 2. 仮想DOMを生成 (React.createElement)
     * 3. 実 DOMを更新 (ReactDOM.render)
     * 4. カウンターを更新 (副作用)
     *
     * ReactのライフサイクルではcomponentDidUpdateに相当。
     * React HooksではuseEffectに相当する処理です。
     */
    #handleChange = () => {
        const todoCountElement = this.todoCountElement;
        const todoListContainerElement = this.todoListContainerElement;
        const todoItems = this.#todoListModel.getTodoItems();
        const todoListElement = this.#todoListView.createElement(todoItems, {
            // Appに定義したリスナー関数を呼び出す
            onUpdateTodo: ({ id, completed }) => {
                this.#handleUpdate({ id, completed });
            },
            onDeleteTodo: ({ id }) => {
                this.#handleDelete({ id });
            }
        });
        render(todoListElement, todoListContainerElement);
        todoCountElement.textContent = `Todoアイテム数: ${this.#todoListModel.getTotalCount()}`;
    };

    /**
     * コンポーネントのマウント - ReactのcomponentDidMount相当
     *
     * Redux StoreへのsubscribeとDOMイベントリスナーの登録を行います。
     * React-Reduxの<Provider>とconnect()によって
     * 自動的に行われる処理を手動で実装しています。
     */
    mount() {
        this.#todoListModel.onChange(this.#handleChange);
        this.formElement.addEventListener("submit", this.#handleSubmit);
    }

    /**
     * コンポーネントのアンマウント - ReactのcomponentWillUnmount相当
     *
     * Storeからのunsubscribeとイベントリスナーの解除を行い、
     * メモリリークを防ぎます。React Hooksでは
     * useEffectのcleanup関数で実装される処理です。
     */
    unmount() {
        this.#todoListModel.offChange(this.#handleChange);
        this.formElement.removeEventListener("submit", this.#handleSubmit);
    }
}
