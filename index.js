import * as Dice from "./dice.js";

const sum = arrayToSum => arrayToSum.reduce((sum, val) => sum + val);

const splitArrayByCategories = (arrayToSplit, getCategory) =>
{
    return arrayToSplit.reduce((splitted, obj) => {
        let category = getCategory(obj);
        if (splitted[category] === undefined)
            splitted[category] = [obj];
        else
            splitted[category].push(obj);
		return splitted;
    }, {});
};

const getProbabilitiesBySum = diceResults =>
{
	return Object.entries(splitArrayByCategories(diceResults, res => sum(res.outcome)))
			.map(([sum, resultsOfSum]) =>
		({
			outcome: sum,
			prob: resultsOfSum.reduce((probSum, result) => probSum + result.prob, 0)
		}));
}

document.addEventListener('DOMContentLoaded', event => {
	const probabilityListElement = document.getElementById('probabilities');
	const historyListElement = document.getElementById('history');
	const bySumCheckboxElement = document.getElementById('by-sum-checkbox');
	const diceInputElement = document.getElementById('dice-input');
	const facesInputElement = document.getElementById('faces-input');
	const diceValueElement = document.getElementById('dice-value');
	const facesValueElement = document.getElementById('faces-value');
	const resultElement = document.getElementById('result');
	
	let diceResults;
	let history;
	let probs;
	let numOfDice = parseInt(diceInputElement.value);
	let faces = parseInt(facesInputElement.value);
	let bySum = bySumCheckboxElement?.checked;
	let modifier = 2;
	facesValueElement.innerText = faces
	diceValueElement.innerText = numOfDice;
	
	
	const pushToHistory = result => {
		history.push(result.outcome);
		let newEntry = document.createElement('li');
		newEntry.innerText = sum(result.outcome) + ': ' + result.outcome;
		historyListElement.insertBefore(newEntry, historyListElement.firstChild);
	};
	
	const popFromHistory = () => {
		historyListElement.removeChild(historyListElement.firstElementChild);
		return history.pop();
	}
	
	const initialize = () => 
	{
		diceResults = Dice.initNewDiceResults(faces, numOfDice);
		newProbabilityList();
		history = [];
		historyListElement.textContent = '';
		resultElement.innerText = '';
	};
	
	const updateProbabilityList = () => 
	{
		probabilities = bySum? getProbabilitiesBySum(diceResults) : diceResults;
		let startTime = performance.now();
		probabilities.forEach((probability, index) => {
			probabilityListElement.children[index].lastElementChild.innerText = probability.prob;
		});
	};
	
	const newProbabilityList = () =>
	{
		probabilities = bySum? getProbabilitiesBySum(diceResults) : diceResults;
		probabilityListElement.textContent = '';
		const newListFrag = document.createDocumentFragment();
		probabilities.forEach(probability => 
		{
			const probListItem = document.createElement('li');
			const probResult = document.createElement('p');
			const probValue = document.createElement('p');
			probResult.style.display = 'inline'
			probValue.style.display = 'inline'
			probResult.innerText = probability.outcome + ': ';
			probValue.innerText = probability.prob;
			probListItem.appendChild(probResult);
			probListItem.appendChild(probValue);
			newListFrag.appendChild(probListItem);
		});
		probabilityListElement.appendChild(newListFrag);
	};
	
	initialize();
	
	bySumCheckboxElement?.addEventListener('change', e => 
	{
		bySum = bySumCheckboxElement?.checked;
		newProbabilityList();
	});
	
	diceInputElement?.addEventListener('change', e => 
	{
		numOfDice = parseInt(diceInputElement?.value);
		diceValueElement.innerText = numOfDice;
		initialize();
	});
	
	facesInputElement?.addEventListener('change', e => 
	{
		faces = parseInt(facesInputElement?.value);
		facesValueElement.innerText = faces
		initialize();
	});
	
	document.getElementById('roll-button')?.addEventListener('click', e => 
	{
		const result = Dice.roll(diceResults);
		diceResults = Dice.modifyProbabilities(diceResults, result.outcome, modifier);
		resultElement.innerText = sum(result.outcome) + ': ' + result.outcome;
		pushToHistory(result);
		updateProbabilityList();
	});
	
	document.getElementById('reset-button')?.addEventListener('click', e => 
	{
		initialize();
	});
	
	document.getElementById('unroll-button')?.addEventListener('click', e => 
	{
		if (history.length > 0)
		{
			diceResults = Dice.modifyProbabilities(diceResults, popFromHistory(), modifier, {cancelLastRoll: true});
			updateProbabilityList();
			if (history.length > 0)
			{
				const previousResult = history[history.length - 1];
				resultElement.innerText = sum(previousResult) + ': ' + previousResult;				
			}
			else
				resultElement.innerText = '';
		}
	});
});