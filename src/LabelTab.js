import stylesheet from './stocktab.css' assert { type: 'css' };

export class LabelTab extends HTMLElement {
    #shadowRoot
    constructor() {
        // Always call super first in constructor
        super();

        //Isolate css to this
        this.#shadowRoot = this.attachShadow({ mode: 'open'})
        this.#shadowRoot.adoptedStyleSheets = [stylesheet]
    }

    async connectedCallback() {
            let res = await fetch( 'LabelTab.html' )

            this.#shadowRoot.innerHTML = await res.text()

        }
}

customElements.define('label-tab', LabelTab);
