/**
 * html-util - ReactのDOM操作ユーティリティの再実装
 *
 * このモジュールは、ReactとReactDOMが提供する以下の機能を
 * 純粋なJavaScriptで実装しています：
 *
 * 1. React.createElement() - 仮想DOM要素の生成
 * 2. ReactDOM.render() - 仮想DOMから実DOMへの変換
 * 3. XSS対策 - 文字列のサニタイゼーション
 *
 * Reactの仮想DOMシステム:
 * - JSX → React.createElement() → 仮想DOMオブジェクト
 * - 仮想DOM → Reconciliation → 実DOM更新
 *
 * このモジュールの簡略化された実装:
 * - テンプレートリテラル → element関数 → 実DOM要素
 * - 実DOM要素 → render関数 → DOM更新
 *
 * 本来のReactでは、以下の最適化が行われます：
 * - Virtual DOM Diffing: 最小限のDOM操作
 * - Batch Updates: 複数の更新をまとめて処理
 * - Fiber Architecture: 非同期レンダリング
 */

/**
 * XSS対策: 特殊文字のエスケープ処理
 *
 * ReactのJSXでは、文字列は自動的にエスケープされます。
 * この関数は、ReactのdefaultPropsやdangerouslySetInnerHTML
 * を使わない限り、デフォルトで行われる処理と同等です。
 *
 * @param {string} str エスケープする文字列
 * @returns {string} エスケープ済みの安全な文字列
 */
export function escapeSpecialChars(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * HTML文字列からDOM要素への変換 - Reactの仮想DOMから実DOMへの変換に相当
 *
 * Reactでは、仮想DOMオブジェクトから実DOM要素への変換が
 * ReactDOM内部で行われます。この関数はその簡略版で、
 * template要素を使用して安全にDOMを生成します。
 *
 * @param {string} html HTML文字列
 * @returns {Element} 生成されたDOM要素
 */
export function htmlToElement(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content.firstElementChild;
}

/**
 * タグ付きテンプレートリテラル - React.createElement()の代替実装
 *
 * ReactのJSXはトランスパイル時にReact.createElement()に変換されます。
 * この関数は、テンプレートリテラルを使用して同様の機能を提供し、
 * 以下の処理を行います：
 *
 * 1. テンプレートリテラルの解析
 * 2. 動的な値の埋め込み（XSS対策済み）
 * 3. HTML文字列からDOM要素の生成
 *
 * ReactのJSX例:
 * ```jsx
 * <li>{todoItem.title}</li>
 * ```
 *
 * この関数の使用例:
 * ```js
 * element`<li>${todoItem.title}</li>`
 * ```
 *
 * @param {TemplateStringsArray} strings テンプレートリテラルの静的部分
 * @param {...any} values テンプレートリテラルの動的部分
 * @returns {Element} 生成されたDOM要素（ReactのReactElementに相当）
 */
export function element(strings, ...values) {
    const htmlString = strings.reduce((result, str, i) => {
        const value = values[i - 1];
        if (typeof value === "string") {
            return result + escapeSpecialChars(value) + str;
        } else {
            return result + String(value) + str;
        }
    });
    return htmlToElement(htmlString);
}

/**
 * DOMレンダリング - ReactDOM.render()の再実装
 *
 * ReactDOM.render(component, container)と同じ役割を果たします。
 * 仮想DOM（または実DOM要素）を指定されたコンテナにマウントします。
 *
 * Reactとの違い:
 * - React: 差分検出で最小限のDOM更新
 * - この実装: 全体を置き換え（簡略化のため）
 *
 * 本来のReactでは：
 * - Virtual DOM Diffingを使用して変更箇所を特定
 * - 最小限のDOM操作で効率的に更新
 * - Key属性を使用してリスト要素を追跡
 *
 * @param {Element} bodyElement レンダリングする要素（Reactコンポーネント）
 * @param {Element} containerElement マウント先のコンテナ（ルート要素）
 */
export function render(bodyElement, containerElement) {
    // containerElementの中身を空にする
    containerElement.innerHTML = "";
    // containerElementの直下にbodyElementを追加する
    containerElement.appendChild(bodyElement);
}
