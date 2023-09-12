import stylesheet from './stocktab.css' assert { type: 'css' };

export class TotalTab extends HTMLElement {
	#shadowRoot

	#turnNumberLabel
	#buyValueLabel
	#sellValueLabel
	#networthLabel
	#remainingLiquidValueLabel
	#confirmTradeButton
	#endTurnButton

	#liquidValue
    #networthValue
    #previousNetworth
	#buyValue
	#sellValue
	#turnNumber
	constructor() {
		// Always call super first in constructor
		super();
		//Isolate css to this
		this.#shadowRoot = this.attachShadow({ mode: 'open'})
		this.#shadowRoot.adoptedStyleSheets = [stylesheet]
	}

	async connectedCallback() {
			let res = await fetch( 'TotalTab.html' )

			this.#buyValue = 0
            this.#sellValue = 0
            this.#previousNetworth = 10000

			this.#shadowRoot.innerHTML = await res.text()

			this.#liquidValue = this.#shadowRoot.getElementById("liquid")
			this.#liquidValue.addEventListener("input", (e) => {updateNetworth()})
			this.#networthValue = this.#shadowRoot.getElementById("networth")

			this.#buyValueLabel = this.#shadowRoot.getElementById("buyTotal")
			this.#sellValueLabel = this.#shadowRoot.getElementById("sellTotal")
			this.#networthLabel = this.#shadowRoot.getElementById("networthLabel")

			this.#remainingLiquidValueLabel = this.#shadowRoot.getElementById("remainingLiquid")

			this.#confirmTradeButton = this.#shadowRoot.getElementById("confirmTrade")
            this.#confirmTradeButton.onclick = (event) => {
                                			this.confirmTrade()
                                		}

			this.#turnNumberLabel = this.#shadowRoot.getElementById("turnNumber")
			this.#turnNumber = 1
			this.#endTurnButton = this.#shadowRoot.getElementById("endTurn")
			this.#endTurnButton.onclick = (event) => {
                                            			this.endTurn()
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

	getNetworthValue()
	{
		return parseInt(this.#networthValue.value)
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

	calculateNetworthChange()
	{
		var change = ((this.getNetworthValue() / this.#previousNetworth * 100) - 100)
		return change.toFixed(2)
	}

	endTurn()
	{
		this.#networthLabel.textContent = "Networth (" + this.calculateNetworthChange() + "%)"
		this.#previousNetworth = this.getNetworthValue()
		this.#turnNumber = this.#turnNumber + 1
		this.#turnNumberLabel.textContent = "Turn " + this.#turnNumber
		this.dispatchEvent(new CustomEvent("endTurn",{
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

function updateNetworth()
{
    totalTab.setNetworth(stockTabs);
}

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
