// Utils
import findIfExistsWithinObject from './findIfExistsWithinObject';

// Internal Model
export type LineStringKey = '**EMPTY**' | '**EMPTY_STRING**' | string;
export type LineStringValue = '**EMPTY**' | '**EMPTY_STRING**' | string;
export type LineStringDeltas = { lineKeyDelta: LineStringKey, lineValueDelta: LineStringValue };

// Internals
export const EMPTY = '**EMPTY**';
export const EMPTY_STRING = '**EMPTY_STRING**';

// Internal Utils
const buildDelta = (delta: null | string): LineStringKey | LineStringValue => {
	if (delta === null)
		return EMPTY;

	if (delta === '""')
		return EMPTY_STRING;

	return delta;
};

const getDeltasForLineStringWithoutColon = (stringDelta: string): LineStringDeltas => {
	const lineKeyDelta = stringDelta === '' || ['{', '}', '[', ']'].includes(stringDelta[0])
		? null
		: stringDelta;

	const lineValueDelta = lineKeyDelta
		? null
		: stringDelta === ''
			? null
			: stringDelta;

	return {
		lineKeyDelta: buildDelta(lineKeyDelta),
		lineValueDelta: buildDelta(lineValueDelta)
	};
};

const getDeltasForLineStringWithColon = (stringDelta: string): LineStringDeltas => {
	const key = stringDelta.substring(0, stringDelta.indexOf('":') + 1).trim();
	const lineKeyDelta = key === ''
		? null
		: key;

	const value = stringDelta.substring(stringDelta.indexOf('":') + 2).trim();
	const lineValueDelta = value === ''
		? null
		: value;

	return {
		lineKeyDelta: buildDelta(lineKeyDelta),
		lineValueDelta: buildDelta(lineValueDelta)
	};
};

// Implementation
const getLineStringDeltas = (existingLineStringDeltas: LineStringDeltas[], lineString: string, lineStringIndex: number): LineStringDeltas => {
	const stringDelta: string | string[] = lineString.trim().replaceAll(',', '');

	let lineStringDeltas;

	if (stringDelta.includes(':'))
		lineStringDeltas = getDeltasForLineStringWithColon(stringDelta);
	else {
		lineStringDeltas = getDeltasForLineStringWithoutColon(stringDelta);

		if (!['{', '}', '[', ']'].includes(lineStringDeltas.lineValueDelta)) {
			const lineStringDeltasList = [...existingLineStringDeltas, lineStringDeltas];

			const isInArray = findIfExistsWithinObject(lineStringDeltasList, lineStringIndex, '[');

			if (isInArray) {
				lineStringDeltas = {
					lineKeyDelta: lineStringDeltas.lineValueDelta,
					lineValueDelta: lineStringDeltas.lineKeyDelta
				};
			}
		}
	}

	return lineStringDeltas;
};

export default getLineStringDeltas;
