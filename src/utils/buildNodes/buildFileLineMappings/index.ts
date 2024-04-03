// Model
import type { FileLineMapping, JSONValue } from '../../../model';
import type { LineStringDeltas } from './getLineStringDeltas';
import type { LineStringFlags } from './buildLineStringFlags';

// Utils
import buildLineObjectValues from './buildLineObjectValues';
import buildLineStringFlags from './buildLineStringFlags';
import getLineStringDeltas, { EMPTY } from './getLineStringDeltas';
import setFileLinePaths from './setFileLinePaths';
import setFileLinePositions from './setFIleLinePositions';

// Internal Utils
const buildLineStringDeltas = (fileLineStrings: string[]): LineStringDeltas[] => {
	const lineStringDeltasList = fileLineStrings.reduce(
		(currentLineStringDeltasList, lineString, lineIndex): LineStringDeltas[] => {
			const lineStringDeltas = getLineStringDeltas(currentLineStringDeltasList, lineString, lineIndex);

			currentLineStringDeltasList.push(lineStringDeltas);

			return currentLineStringDeltasList;
		},
		[] as LineStringDeltas[]
	);

	return lineStringDeltasList;
};

const getClosingBracketIndex = (fileLineStringDeltasList: LineStringDeltas[], lineIndex: number): number => {
	const getBracket = (i: number): number => {
		const delta = fileLineStringDeltasList[i].lineValueDelta;

		if (delta === EMPTY)
			return getBracket(i - 1);

		return i;
	};

	return getBracket(lineIndex);
};

const buildParsedValue = (filePath: string, fileLineStringDeltasList: LineStringDeltas[], lineIndex: number, lineStringValues: null | string[], lineStringFlags: LineStringFlags): JSONValue => {
	try {
		const { lineValueDelta } = fileLineStringDeltasList[lineIndex];

		if (lineStringFlags.valueIsEmptyString)
			return '';

		if (lineStringFlags.valueIsEmpty)
			return null;

		if (lineStringFlags.valueIsObjectClose || lineStringFlags.valueIsArrayClose) {
			try {
				return JSON.parse(lineValueDelta);
			} catch (e) {
				return lineValueDelta;
			}
		}

		if (lineStringValues) {
			const closingBracketIndex = getClosingBracketIndex(fileLineStringDeltasList, lineIndex + lineStringValues.length - 1);

			const lineStrings = [
				...lineStringValues.slice(0, closingBracketIndex + 1)
			];

			lineStrings[0] = lineValueDelta;
			lineStrings[lineStrings.length - 1] = fileLineStringDeltasList[closingBracketIndex].lineValueDelta;

			const objectAsString = lineStrings.join('\n');

			const result = JSON.parse(objectAsString);

			return result;
		}

		return JSON.parse(lineValueDelta);
	} catch (e) {
		console.log(`WARNING: COULD NOT PARSE JSON VALUE FOR KEY: "${fileLineStringDeltasList[lineIndex].lineKeyDelta}" on line LINE INDEX ${lineIndex}. INSIDE FILE: ${filePath}. Returning null instead.`);
		return null;
	}
};

const buildLineMappings = (filePath: string, fileLineStrings: string[], fileLineStringDeltasList: LineStringDeltas[]): FileLineMapping[] => {
	const fileLineMappings: FileLineMapping[] = fileLineStrings.map(( lineString, lineIndex): FileLineMapping => {
		const { lineKeyDelta: lineStringKey, lineValueDelta: lineStringValue } = fileLineStringDeltasList[lineIndex];

		const lineValues: null | string[] = buildLineObjectValues(fileLineStrings, fileLineStringDeltasList, lineIndex, lineStringValue);

		const lineStringFlags = buildLineStringFlags(fileLineStrings, fileLineStringDeltasList, lineIndex, lineStringKey, lineStringValue);

		const lineStringValueParsed = buildParsedValue(filePath, fileLineStringDeltasList, lineIndex, lineValues, lineStringFlags);

		const fileLineMapping: FileLineMapping = {
			linePath: null!,
			lineParentPath: null!,
			lineIndex,
			lineString,
			lineStringKey,
			lineStringValue,
			lineValues,
			lineKeyPosition: null!,
			lineValuePosition: null!,
			lineStringFlags,
			lineStringValueParsed,
			lineFile: filePath,
			lineFileStrings: fileLineStrings
		};

		return fileLineMapping;
	});

	return fileLineMappings;
};

// Implementation
const buildFileLineMappings = (filePath: string, fileString: string): FileLineMapping[] => {
	const fileLineStrings: string[] = fileString.replaceAll('\r', '').split('\n');

	const fileLineStringDeltasList: LineStringDeltas[] = buildLineStringDeltas(fileLineStrings);

	const fileLineMappings: FileLineMapping[] = buildLineMappings(filePath, fileLineStrings, fileLineStringDeltasList);

	setFileLinePaths(fileLineMappings);

	setFileLinePositions(fileLineMappings);

	return fileLineMappings;
};

export default buildFileLineMappings;
