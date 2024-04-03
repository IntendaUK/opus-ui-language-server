// Model
import type { LineStringDeltas } from './getLineStringDeltas';

// Internals
const brackets = ['{', '[', '}', ']'];

// Implementation
const findIfExistsWithinObject = (fileLineStringDeltas: LineStringDeltas[], lineStringIndex: number, searchObjectBracket: '{' | '['): boolean => {
	const foundBrackets: string[] = [];

	for (const [lineStringDeltasIndex, lineStringDeltas] of Object.entries(fileLineStringDeltas)) {
		const { lineValueDelta } = lineStringDeltas;

		if (lineStringIndex === +lineStringDeltasIndex) {
			if (lineValueDelta === '}' || lineValueDelta === ']')
				foundBrackets.pop();

			return foundBrackets.slice(-1)[0] === searchObjectBracket;
		}

		if (!brackets.includes(lineValueDelta))
			continue;

		if (lineValueDelta === '{' || lineValueDelta === '[')
			foundBrackets.push(lineValueDelta);
		else
			foundBrackets.pop();
	}

	return false;
};

export default findIfExistsWithinObject;
