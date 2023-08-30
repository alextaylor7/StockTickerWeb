//import stylesheet from './stocktab.css' assert { type: 'css' };

export class TotalTab extends HTMLElement {
	#shadowRoot

	#buyValueLabel
	#sellValueLabel
	#remainingLiquidValueLabel
	#confirmTradeButton

	#liquidValue
    #networthValue
	#buyValue
	#sellValue
	constructor() {
		// Always call super first in constructor
		super();
		//Isolate css to this
		this.#shadowRoot = this.attachShadow({ mode: 'open'})
		//shadowRoot.adoptedStyleSheets = [stylesheet]
	}

	async connectedCallback() {
			let res = await fetch( 'TotalTab.html' )

			this.#buyValue = 0
            this.#sellValue = 0

			this.#shadowRoot.innerHTML = await res.text()

			this.#liquidValue = this.#shadowRoot.getElementById("liquid")
			this.#networthValue = this.#shadowRoot.getElementById("networth")

			this.#buyValueLabel = this.#shadowRoot.getElementById("buyTotal")
			this.#sellValueLabel = this.#shadowRoot.getElementById("sellTotal")

			this.#remainingLiquidValueLabel = this.#shadowRoot.getElementById("remainingLiquid")

			this.#confirmTradeButton = this.#shadowRoot.getElementById("confirmTrade")
            this.#confirmTradeButton.onclick = (event) => {
                                			this.confirmTrade()
                                		}
		}

	// Setters
	setNetworth(stockTabs)
	{
		var stockValues = 0
		stockTabs.forEach(function(stockTab){
			stockValues = stockValues + stockTab.getOwnedValue()
		})
		var total = stockValues + this.getLiquidValue()
		this.setNetworthValue(total)
	}

	setNetworthValue(value)
	{
		this.#networthValue.value = value
	}

	setLiquidValue(value)
	{
		this.#liquidValue.value = value
	}

	// Value Setters
	setToSellValue(value)
	{
		this.#sellValue = value
		this.#sellValueLabel.textContent = "-" + this.#sellValue + "$"
	}

	setToBuyValue(value)
	{
		this.#buyValue = value
		this.#buyValueLabel.textContent = "+" + this.#buyValue + "$"
	}

	// Getters
	getLiquidValue()
	{
		return parseInt(this.#liquidValue.value)
	}

	getToSellValue()
	{
		return this.#sellValue
	}

	getToBuyValue()
	{
		return this.#buyValue
	}

	getRemainingLiquidValue()
	{
		return this.#sellValue - this.#buyValue + this.getLiquidValue()
	}

	// Modifiers
	addDividend(div)
	{
		this.setLiquidValue(this.getLiquidValue() + div)
	}

	confirmTrade()
	{
		this.setLiquidValue(this.getRemainingLiquidValue())
		this.setToBuyValue(0)
		this.setToSellValue(0)
		this.dispatchEvent(new CustomEvent("confirmTrade",{
        				}));
	}

	// Update
	updateBuySellTotals(stockTabs)
	{
		var toBuyTotal = 0
		var toSellTotal = 0
		stockTabs.forEach(function(stockTab){
			toBuyTotal += stockTab.getBuyValue()
			toSellTotal += stockTab.getSellValue()
		})
		this.setToBuyValue(toBuyTotal)
		this.setToSellValue(toSellTotal)
		this.updateRemainingLiquid()
	}

	updateRemainingLiquid()
	{
		this.#remainingLiquidValueLabel.textContent = this.getRemainingLiquidValue() + "$"
		if(this.getRemainingLiquidValue() < 0)
		{
			this.#confirmTradeButton.disabled = true
		}
		else
		{
			this.#confirmTradeButton.disabled = false
		}
	}
}

customElements.define('total-tab', TotalTab);

// Get the total tab
var totalTab = document.querySelector("total-tab")

var stockTabs = document.querySelectorAll("stock-tab")

stockTabs.forEach(function(stockTab){
	stockTab.addEventListener('dividendClicked', (event) => {
						totalTab.addDividend(event.target.getDividendValue(event.detail.dividend))
						totalTab.updateRemainingLiquid()
						totalTab.setNetworth(stockTabs)
					});
	stockTab.addEventListener('marketPriceChanged', (event) => {
    						totalTab.setNetworth(stockTabs)
    						totalTab.updateBuySellTotals(stockTabs)
    					});
    stockTab.addEventListener('amountOwnedChanged', (event) => {
        						totalTab.setNetworth(stockTabs)
        					});
    stockTab.addEventListener('buyAmountChanged', (event) => {
        						totalTab.updateBuySellTotals(stockTabs)
        					});
	stockTab.addEventListener('sellAmountChanged', (event) => {
								totalTab.updateBuySellTotals(stockTabs)
							});
})
