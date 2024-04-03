// Model
import type { FileLineMapping, KeyPosition } from '../../../../../model';

// Internals
import { EMPTY, EMPTY_STRING } from '../../getLineStringDeltas';

// Utils
import getDeltaIndexesInLineString from './getDeltaIndexesInLineString';

// Internal Utils
const getPositionForEmptyKey = (fileLineMapping: FileLineMapping): KeyPosition => {
	const { lineIndex, lineStringFlags } = fileLineMapping;

	let characterStartIndex = 0;
	let characterEndIndex = 0;

	if (lineStringFlags.lineIsObjectEntry) {
		characterStartIndex = fileLineMapping.lineString.length;
		characterEndIndex = characterStartIndex;
	}

	return {
		lineIndex,
		characterStartIndex,
		characterEndIndex
	};
};

const getPositionForEmptyStringKey = (fileLineMapping: FileLineMapping): KeyPosition => {
	const { lineIndex, lineString } = fileLineMapping;

	const searchEmptyStringDelta = '""';

	const { characterStartIndex, characterEndIndex } = getDeltaIndexesInLineString(lineString, searchEmptyStringDelta);

	return {
		lineIndex,
		characterStartIndex,
		characterEndIndex
	};
};

const getPosition = (fileLineMapping: FileLineMapping): KeyPosition => {
	const { lineIndex, lineStringKey, lineString } = fileLineMapping;

	const { characterStartIndex, characterEndIndex } = getDeltaIndexesInLineString(lineString, lineStringKey);

	return {
		lineIndex,
		characterStartIndex,
		characterEndIndex
	};
};

// Implementation
const getKeyPosition = (fileLineMapping: FileLineMapping): KeyPosition => {
	const { lineStringKey } = fileLineMapping;

	if (lineStringKey === EMPTY)
		return getPositionForEmptyKey(fileLineMapping);

	if (lineStringKey === EMPTY_STRING)
		return getPositionForEmptyStringKey(fileLineMapping);

	return getPosition(fileLineMapping);
};

export default getKeyPosition;
