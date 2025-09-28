/**
 * EventEmitterクラス - Reduxのdispatch機能を再現
 *
 * このクラスは、Reduxの中核となるイベント駆動アーキテクチャを実装しています。
 * Reduxでは、Actionがdispatchされ、Storeを経由してReducerへ伝達されます。
 * EventEmitterは、この「イベント（Action）の発行と購読」の仕組みを提供します。
 *
 * Reduxのデータフロー:
 * 1. UI操作 → Actionの生成
 * 2. dispatch(action) → EventEmitter.emit()に相当
 * 3. Store内のReducerがActionを受け取る → addEventListener()で登録したリスナーが実行
 * 4. Stateの更新 → リスナー関数内でStateを更新
 * 5. UIの再レンダリング → Stateの変更を検知してViewが更新
 *
 * このパターンにより、データの流れが一方向になり、
 * アプリケーションの状態管理が予測可能になります。
 */
export class EventEmitter {
    // 登録する [イベント名, Set(リスナー関数)] を管理するMap
    #listeners = new Map();
    /**
     * イベントリスナーの登録 - ReduxのStore.subscribe()に相当
     *
     * Reduxでは、Store.subscribe()でStateの変更を監視します。
     * このメソッドは、特定のActionType（イベント名）に対してリスナーを登録し、
     * そのActionがdispatchされたときに実行される処理を定義します。
     *
     * @param {string} type イベント名（ReduxのActionTypeに相当）
     * @param {Function} listener イベントリスナー（Reducerの処理後に実行される関数）
     */
    addEventListener(type, listener) {
        // 指定したイベントに対応するSetを作成しリスナー関数を登録する
        if (!this.#listeners.has(type)) {
            this.#listeners.set(type, new Set());
        }
        const listenerSet = this.#listeners.get(type);
        listenerSet.add(listener);
    }

    /**
     * イベントのディスパッチ - Reduxのdispatch(action)に相当
     *
     * Reduxのdispatch関数と同じ役割を果たします。
     * UIからのイベント（ユーザー操作）を受け取り、
     * 登録されているすべてのリスナー（Reducerのような処理）を実行します。
     * これにより、Stateの更新とViewの再レンダリングが連鎖的に発生します。
     *
     * @param {string} type イベント名（ReduxのAction.typeに相当）
     */
    emit(type) {
        // 指定したイベントに対応するSetを取り出し、すべてのリスナー関数を呼び出す
        const listenerSet = this.#listeners.get(type);
        if (!listenerSet) {
            return;
        }
        listenerSet.forEach(listener => {
            listener.call(this);
        });
    }

    /**
     * イベントリスナーの解除 - ReduxのStore.unsubscribe()に相当
     *
     * コンポーネントのアンマウント時など、不要になったリスナーを解除します。
     * メモリリークを防ぎ、不要な処理の実行を避けるために重要です。
     *
     * @param {string} type イベント名（ReduxのActionTypeに相当）
     * @param {Function} listener 解除するイベントリスナー
     */
    removeEventListener(type, listener) {
        // 指定したイベントに対応するSetを取り出し、該当するリスナー関数を削除する
        const listenerSet = this.#listeners.get(type);
        if (!listenerSet) {
            return;
        }
        listenerSet.forEach(ownListener => {
            if (ownListener === listener) {
                listenerSet.delete(listener);
            }
        });
    }
}
