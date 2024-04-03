// Model
import type { LineStringValue, LineStringDeltas } from './getLineStringDeltas';

// Implementation
const buildLineObjectValues = (fileLineStrings: string[], fileLineStringDeltasList: LineStringDeltas[], lineIndex: number, lineValueDelta: LineStringValue): null | string[] => {
	if (lineIndex === 0)
		return fileLineStrings.slice();

	const isNotOpeningObject = !['{', '['].includes(lineValueDelta[0]);

	if (isNotOpeningObject)
		return null;

	let leadingBracketCount = 1;

	const startingBracket = lineValueDelta[0];
	const endingBracket = lineValueDelta[0] === '{' ? '}' : ']';

	const objectStartIndex = lineIndex;

	const objectEndIndex = fileLineStrings.findIndex((_, lineStringIndex) => {
		if (lineStringIndex < lineIndex + 1)
			return false;

		const { lineValueDelta: nextDeltaValue } = fileLineStringDeltasList[lineStringIndex];

		if (nextDeltaValue === startingBracket)
			leadingBracketCount++;

		return nextDeltaValue === endingBracket && leadingBracketCount-- === 1;
	}) + 1;

	const lineValues = fileLineStrings.slice(objectStartIndex, objectEndIndex);

	return lineValues;
};

export default buildLineObjectValues;
