import stylesheet from './stocktab.css' assert { type: 'css' };

export class StockTab extends HTMLElement {
	#shadowRoot

	#dividend5
	#dividend10
	#dividend20
	#marketPriceSpinBox
	#amountOwnedSpinBox
	#ownedValue
	#price500
	#toBuySpinBox
	#buyValueLabel
	#toSellSpinBox
	#sellValueLabel

	constructor() {
		// Always call super first in constructor
		super();

		//Isolate css to this
		this.#shadowRoot = this.attachShadow({ mode: 'open'})
		this.#shadowRoot.adoptedStyleSheets = [stylesheet]
	}

	async connectedCallback() {
		let res = await fetch( 'StockTab.html' )

		this.#shadowRoot.innerHTML = await res.text()
		this.#shadowRoot.getElementById("title").textContent = this.attributes["title"].value

		//Dividends
		this.#dividend5 = this.#shadowRoot.getElementById("dividend5")
		this.#dividend5.onclick = (e) => {
		   this.dispatchEvent(new CustomEvent("dividendClicked",{
			   detail: {
				   dividend: 5,
			   },
		   }));
		}

		this.#dividend10 = this.#shadowRoot.getElementById("dividend10")
		this.#dividend10.onclick = (e) => {
			this.dispatchEvent(new CustomEvent("dividendClicked",{
				detail: {
					dividend: 10,
				},
			}));
		}

		this.#dividend20 = this.#shadowRoot.getElementById("dividend20")
		this.#dividend20.onclick = (e) => {
			this.dispatchEvent(new CustomEvent("dividendClicked",{
				detail: {
					dividend: 20,
				},
			}));
		}

		//Market price
		this.#marketPriceSpinBox = this.#shadowRoot.getElementById("marketPriceSpinBox")
		this.#marketPriceSpinBox.addEventListener("input", (e) => {this.marketPriceChange(e)})

		//Amount owned
		this.#amountOwnedSpinBox = this.#shadowRoot.getElementById("amountOwnedSpinBox")
		this.#amountOwnedSpinBox.addEventListener("input", (e) => {this.amountOwnedChange(e)})


		//Owned Value
		this.#ownedValue = this.#shadowRoot.getElementById("ownedValue")

		//Price per 500
		this.#price500 = this.#shadowRoot.getElementById("price500")

		//toBuy
		this.#toBuySpinBox = this.#shadowRoot.getElementById("toBuySpinBox")
		this.#toBuySpinBox.addEventListener("input", (e) => {this.buyAmountChange(e)})
		this.#buyValueLabel = this.#shadowRoot.getElementById("buyValueLabel")

		//toSell
		this.#toSellSpinBox = this.#shadowRoot.getElementById("toSellSpinBox")
		this.#toSellSpinBox.addEventListener("input", (e) => {this.sellAmountChange(e)})
		this.#sellValueLabel = this.#shadowRoot.getElementById("sellValueLabel")

	}
	validateToSellAmount()
	{
		if(this.getOwnedAmount() < this.getSellAmount())
		{
			this.setSellAmount(this.getOwnedAmount())
		}
	}

	// Listeners
	marketPriceChange(e) {
		this.#price500.innerText = (5 * e.target.value) + "$"
		this.updateOwnedValue()
		this.updateBuyValue()
		this.updateSellValue()
		this.dispatchEvent(new CustomEvent("marketPriceChanged",{
					  detail: {
							marketPrice: e.target.value,
					  },
				  }));
	}

	amountOwnedChange(e) {
		this.updateOwnedValue()
		this.dispatchEvent(new CustomEvent("amountOwnedChanged",{
					  detail: {
						  ownedValue: e.target.value,
					  },
				  }));
	}

	buyAmountChange(e) {
		this.updateBuyValue()
		this.updateSellValue()
		this.dispatchEvent(new CustomEvent("buyAmountChanged",{
					  }));
	}

	sellAmountChange(e) {
		this.validateToSellAmount()
		this.updateBuyValue()
		this.updateSellValue()
		this.dispatchEvent(new CustomEvent("sellAmountChanged",{
					  }));
	}

	// Inner Updates
	updateBuyValue()
	{
		this.#buyValueLabel.innerText = this.getBuyValue() + "$"
	}

	updateSellValue()
	{
		this.#sellValueLabel.innerText = this.getSellValue() + "$"
	}

	updateOwnedValue()
	{
		this.#ownedValue.innerText = this.getOwnedValue() + "$"
	}

	// Setters
	setSellAmount(amount)
	{
		this.#toSellSpinBox.value = amount
		this.updateSellValue()
	}

	setBuyAmount(amount)
	{
		this.#toBuySpinBox.value = amount
		this.updateBuyValue()
	}

	setOwnedAmount(amount)
	{
		this.#amountOwnedSpinBox.value = amount
		this.updateOwnedValue()
	}

	// Getters
	getMarketPrice()
	{
		return parseInt(this.#marketPriceSpinBox.value)
	}

	getOwnedAmount()
	{
		return parseInt(this.#amountOwnedSpinBox.value)
	}

	getSellAmount()
	{
		return parseInt(this.#toSellSpinBox.value)
	}

	getBuyAmount()
	{
		return parseInt(this.#toBuySpinBox.value)
	}

	// Value getters
	getOwnedValue()
	{
		return (this.getOwnedAmount() * this.getMarketPrice()) / 100
	}

	getSellValue()
	{
		return (this.getSellAmount() * this.getMarketPrice()) / 100
	}

	getBuyValue()
	{
		return (this.getBuyAmount() * this.getMarketPrice()) / 100
	}

	getDividendValue(dividend)
	{
		return (dividend * this.getOwnedAmount()) / 100
	}

	// Modifiers
	confirmTrade()
	{
		var newOwnedAmount = this.getOwnedAmount() + this.getBuyAmount() - this.getSellAmount()
		this.setOwnedAmount(newOwnedAmount)
		this.setSellAmount(0)
		this.setBuyAmount(0)
	}
}

customElements.define('stock-tab', StockTab);

var totalTab = document.querySelector("total-tab")

var stockTabs = document.querySelectorAll("stock-tab")

totalTab.addEventListener('confirmTrade', (event) => {
        						stockTabs.forEach(function(stockTab){
									stockTab.confirmTrade()
                                })
        					});