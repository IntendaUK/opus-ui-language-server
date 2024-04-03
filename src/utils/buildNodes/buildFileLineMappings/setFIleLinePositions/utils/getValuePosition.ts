// Utils
import getDeltaIndexesInLineString from './getDeltaIndexesInLineString';

// Model
import type { FileLineMapping, ValuePosition } from '../../../../../model';

// Internals
import { EMPTY, EMPTY_STRING } from '../../getLineStringDeltas';

// Internal Utils
const getPositionForEmptyValue = (fileLineMapping: FileLineMapping): ValuePosition => {
	const { lineIndex } = fileLineMapping;

	return {
		lineStartIndex: lineIndex,
		characterStartIndex: 0,
		lineEndIndex: lineIndex,
		characterEndIndex: 0
	};
};

const getPositionForEmptyStringValue = (fileLineMapping: FileLineMapping): ValuePosition => {
	const { lineIndex, lineString } = fileLineMapping;

	const searchEmptyStringDelta = '""';

	const { characterStartIndex, characterEndIndex } = getDeltaIndexesInLineString(lineString, searchEmptyStringDelta, true);

	return {
		lineStartIndex: lineIndex,
		characterStartIndex,
		lineEndIndex: lineIndex,
		characterEndIndex
	};
};

const getPositionForEndingBracket = (fileLineMapping: FileLineMapping): ValuePosition => {
	const { lineIndex, lineStringValue, lineString } = fileLineMapping;

	const { characterStartIndex, characterEndIndex } = getDeltaIndexesInLineString(lineString, lineStringValue, true);

	return {
		lineStartIndex: lineIndex,
		characterStartIndex,
		lineEndIndex: lineIndex,
		characterEndIndex
	};
};

const getPositionForOpeningBracket = (fileLineMapping: FileLineMapping): ValuePosition => {
	const { lineIndex, lineStringValue, lineString } = fileLineMapping;

	const lineValues = fileLineMapping.lineValues!;

	if (!lineValues.length) {
		return {
			lineStartIndex: lineIndex,
			characterStartIndex: lineString.lastIndexOf(lineStringValue),
			lineEndIndex: lineIndex,
			characterEndIndex: lineStringValue.length - 1
		};
	}

	return {
		lineStartIndex: lineIndex,
		characterStartIndex: lineString.lastIndexOf(lineStringValue),
		lineEndIndex: lineIndex + (lineValues.length - 1),
		characterEndIndex: lineValues.slice(-1)[0].indexOf(lineStringValue[0] === '{' ? '}' : ']')
	};
};

const getPosition = (fileLineMapping: FileLineMapping) => {
	const { lineIndex, lineStringValue, lineString } = fileLineMapping;

	const { characterStartIndex, characterEndIndex } = getDeltaIndexesInLineString(lineString, lineStringValue, true);

	return {
		lineStartIndex: lineIndex,
		characterStartIndex,
		lineEndIndex: lineIndex,
		characterEndIndex
	};
};

// Implementation
const getValuePosition = (fileLineMapping: FileLineMapping): ValuePosition => {
	const { lineStringValue, lineStringFlags } = fileLineMapping;

	if (lineStringValue === EMPTY)
		return getPositionForEmptyValue(fileLineMapping);

	if (lineStringValue === EMPTY_STRING)
		return getPositionForEmptyStringValue(fileLineMapping);

	if (lineStringFlags.valueIsObjectOpen || lineStringFlags.valueIsArrayOpen)
		return getPositionForOpeningBracket(fileLineMapping);

	if (lineStringFlags.valueIsObjectClose || lineStringFlags.valueIsArrayClose)
		return getPositionForEndingBracket(fileLineMapping);

	return getPosition(fileLineMapping);
};

export default getValuePosition;
