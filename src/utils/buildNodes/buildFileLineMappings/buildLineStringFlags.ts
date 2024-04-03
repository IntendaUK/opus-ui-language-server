// Utils
import findIfExistsWithinObject from './findIfExistsWithinObject';

// Internals
import { EMPTY, EMPTY_STRING } from './getLineStringDeltas';
import { PLACEHOLDER_KEY, PLACEHOLDER_VALUE } from '../../../managers/serverManager/events/onProvideSuggestions/utils/buildDummyNodes';

// Model
import type { LineStringKey, LineStringValue, LineStringDeltas } from './getLineStringDeltas';

// Internal Model
export type LineStringFlags = {
	keyIsEmpty: boolean,
	keyIsEmptyString: boolean,
	keyIsFalsy: boolean,
	valueIsEmpty: boolean,
	valueIsEmptyString: boolean,
	valueIsFalsy: boolean,
	valueIsObjectOpen: boolean,
	valueIsObjectClose: boolean,
	valueIsArrayOpen: boolean,
	valueIsArrayClose: boolean,
	valueIsFileStart: boolean,
	valueIsFileEnd: boolean,
	lineIsObjectEntry: boolean,
	lineIsArrayEntry: boolean
}

const buildLineStringFlags = (fileLineStrings: string[], fileLineStringDeltasList: LineStringDeltas[], lineIndex: number, lineStringKey: LineStringKey, lineStringValue: LineStringValue): LineStringFlags => {
	const keyIsEmpty = lineStringKey === EMPTY || lineStringKey === PLACEHOLDER_KEY;
	const keyIsEmptyString = lineStringKey === EMPTY_STRING;
	const keyIsFalsy = keyIsEmpty || keyIsEmptyString;

	const valueIsEmpty = lineStringValue === EMPTY || lineStringValue === PLACEHOLDER_VALUE;
	const valueIsEmptyString = lineStringValue === EMPTY_STRING;
	const valueIsFalsy = valueIsEmpty || valueIsEmptyString;

	const valueIsObjectOpen = !valueIsFalsy && lineStringValue[0] === '{';
	const valueIsObjectClose = !valueIsFalsy && lineStringValue.slice(-1) === '}';

	const valueIsArrayOpen = !valueIsFalsy && lineStringValue[0] === '[';
	const valueIsArrayClose = !valueIsFalsy && lineStringValue.slice(-1) === ']';

	const valueIsFileStart = lineIndex === 0;
	const valueIsFileEnd = lineIndex === fileLineStrings.length - 1;

	const lineIsObjectEntry = findIfExistsWithinObject(fileLineStringDeltasList, lineIndex, '{');
	const lineIsArrayEntry = findIfExistsWithinObject(fileLineStringDeltasList, lineIndex, '[');

	return {
		keyIsEmpty,
		keyIsEmptyString,
		keyIsFalsy,
		valueIsEmpty,
		valueIsEmptyString,
		valueIsFalsy,
		valueIsObjectOpen,
		valueIsObjectClose,
		valueIsArrayOpen,
		valueIsArrayClose,
		valueIsFileStart,
		valueIsFileEnd,
		lineIsObjectEntry,
		lineIsArrayEntry
	};
};

export default buildLineStringFlags;
