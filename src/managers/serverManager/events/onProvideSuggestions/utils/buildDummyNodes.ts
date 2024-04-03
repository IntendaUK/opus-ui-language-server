// Types
import type { Position } from 'vscode-languageserver';
import type { ModifiedNodes } from '../../../../../utils/buildNodes/buildModifiedFileNodes';
import type { FileLineMapping } from '../../../../../model';
import { Nodes } from '../../../../../model';

// Utils
import getModifiedFileNodes from '../../../../../utils/buildNodes/buildModifiedFileNodes';
import setNodeTypes from '../../../../../utils/buildNodes/setNodeTypes';
import buildFileLineMappings from '../../../../../utils/buildNodes/buildFileLineMappings';
import setComponentNodeTypesAndCallees from '../../../../../utils/buildNodes/setComponentNodeTypesAndCallees';
import { getAbsolutePathFromUri } from '../../../../../utils/pathUtils';

// Managers
import ServerManager from '../../../index';

// Internal Utils
export const PLACEHOLDER_KEY = '"**PLACEHOLDER_KEY**"';
export const PLACEHOLDER_VALUE = '"**PLACEHOLDER_VALUE**"';

const addMissingCommaToPreviousLine = (fileLineMappings: FileLineMapping[], fileLineStrings: string[], fileLineMapping: FileLineMapping) => {
	const { lineIndex } = fileLineMapping;

	const previousLineMapping = fileLineMappings[lineIndex - 1];

	if (
		!previousLineMapping
		||
		(
			previousLineMapping.lineStringFlags.keyIsEmpty
			&&
			previousLineMapping.lineStringFlags.valueIsEmpty
		)
		||
		previousLineMapping.lineStringFlags.valueIsObjectOpen
		||
		previousLineMapping.lineStringFlags.valueIsArrayOpen
	)
		return;

	const alreadyHasComma = previousLineMapping.lineString.trimEnd().slice(-1) === ',';

	if (alreadyHasComma)
		return;

	fileLineStrings[lineIndex - 1] = previousLineMapping.lineString + ',';
};

const addMissingDeltasToCurrentLine = (_fileLineMappings: FileLineMapping[], fileLineStrings: string[], fileLineMapping: FileLineMapping) => {
	const { lineIndex, lineString, lineStringFlags } = fileLineMapping;
	const { lineIsObjectEntry, lineIsArrayEntry } = lineStringFlags;

	if (lineIsObjectEntry) {
		if (fileLineStrings[lineIndex].trim() === '') {
			fileLineStrings[lineIndex] = lineString + `${PLACEHOLDER_KEY}:${PLACEHOLDER_VALUE}`;

			return;
		}

		if (fileLineStrings[lineIndex].trim()[0] !== '"') 
			fileLineStrings[lineIndex] = fileLineStrings[lineIndex].replace(fileLineStrings[lineIndex].trim(), PLACEHOLDER_KEY);

		const [stringBeforeColon, stringAfterColon] = fileLineStrings[lineIndex].split(':');

		if (!stringAfterColon)
			fileLineStrings[lineIndex] = stringBeforeColon + `:${PLACEHOLDER_VALUE}`;
		else if (stringAfterColon.trim() === '')
			fileLineStrings[lineIndex] = stringBeforeColon + `:${stringAfterColon}${PLACEHOLDER_VALUE}`;

		return;
	}

	if (lineIsArrayEntry) {
		if (fileLineStrings[lineIndex].trim() === '')
			fileLineStrings[lineIndex] = PLACEHOLDER_VALUE;

		return;
	}
};

const addMissingCommaToCurrentLine = (fileLineMappings: FileLineMapping[], fileLineStrings: string[], fileLineMapping: FileLineMapping) => {
	const { lineIndex } = fileLineMapping;

	const nextLineMapping = fileLineMappings[lineIndex + 1];

	if (
		!nextLineMapping
		||
		(
			nextLineMapping.lineStringFlags.keyIsEmpty
			&&
			nextLineMapping.lineStringFlags.valueIsEmpty
		)
		||
		(nextLineMapping.lineStringFlags.valueIsObjectClose && !nextLineMapping.lineStringFlags.valueIsObjectOpen)
		||
		(nextLineMapping.lineStringFlags.valueIsArrayClose && !nextLineMapping.lineStringFlags.valueIsArrayOpen)
	)
		return;

	const currentLineString = fileLineStrings[lineIndex];

	const alreadyHasComma = currentLineString.trimEnd().slice(-1) === ',';

	if (alreadyHasComma)
		return;

	fileLineStrings[lineIndex] = currentLineString + ',';
};

const buildFixedFileStringAndValue = (filePath: string, fileString: string, filePosition: Position) => {
	const fileLineMappings = buildFileLineMappings(filePath, fileString);
	const fileLineIndex = filePosition.line;
	const fileLineMapping = fileLineMappings[fileLineIndex];
	const fileLineStrings = fileLineMappings[0].lineValues!;

	addMissingCommaToPreviousLine(fileLineMappings, fileLineStrings, fileLineMapping);

	addMissingDeltasToCurrentLine(fileLineMappings, fileLineStrings, fileLineMapping);

	addMissingCommaToCurrentLine(fileLineMappings, fileLineStrings, fileLineMapping);

	const fixedString = fileLineStrings.join('\n');

	const fixedJson = JSON.parse(fixedString);

	return {
		fileString: fixedString,
		fileValue: fixedJson
	};
};

const getFileStringAndValue = (fileUri: string, filePosition: Position): null | string => {
	const filePath = getAbsolutePathFromUri(fileUri);

	const fileString = ServerManager.documents.get(fileUri)!;

	try {
		const { fileString: fixedFileString } = buildFixedFileStringAndValue(
			filePath,
			fileString,
			filePosition
		);

		return fixedFileString;
	} catch (er) {
		console.log('Couldn\'t fix invalid JSON. Skipping suggestions.');
		return null;
	}
};

// Implementation
const buildDummyNodes = async (fileUri: string, filePosition: Position): Promise<null | Nodes> => {
	const filePath = getAbsolutePathFromUri(fileUri);

	const fileString = getFileStringAndValue(fileUri, filePosition);
	if (fileString === null)
		return null;

	const nodes: Nodes = new Nodes(ServerManager.caches.nodes);

	const modifiedNodes: ModifiedNodes = getModifiedFileNodes(nodes, filePath, fileString);

	modifiedNodes.nodesRemoved.forEach(n => nodes.delete(n.path));

	modifiedNodes.nodesBuilt.forEach(n => nodes.setUnmerge(n.path, n));

	const newFileNode = nodes.get(filePath)!;

	setNodeTypes(nodes, newFileNode);

	setComponentNodeTypesAndCallees(nodes);

	return nodes;
};

export default buildDummyNodes;
