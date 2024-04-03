// Utils
import fileIsOutsideScope from '../../../../utils/fileIsOutsideScope';
import findNodeMatchDataFromFilePosition from '../../../../utils/findNodeMatchDataFromFilePosition';

// Model
import type { TextDocumentPositionParams } from 'vscode-languageserver/node';
import type { CompletionItem, CompletionList, Position } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../utils/findNodeMatchDataFromFilePosition';
import type { JSONObject, Nodes } from '../../../../model';

// Managers
import ServerManager from '../../index';

// Config
import buildDummyNodes from './utils/buildDummyNodes';
import buildCompletionItems from './utils/buildCompletionItems';

// Implementation
const isLastQuote = (fileUri: string, position: Position) => {
	const fileString = ServerManager.documents.get(fileUri)!;

	const fileLine = fileString.split('\n')[position.line];

	if (fileLine[position.character - 1] !== '"')
		return false;

	const isLast = fileLine.lastIndexOf('"') === position.character - 1;

	return isLast;
};

const buildFilteredCompletionItems = (nodes: Nodes, nodeMatchData: NodeMatchData, completionItems: null | CompletionItem[]) => {
	if (!completionItems?.length)
		return [];

	const parentNode = nodes.get(nodeMatchData.node.parentPath!)!;

	const keys = parentNode.valueType === 'object' ? Object.keys(parentNode.value as JSONObject) : [];

	const newCompletionItems: CompletionItem[] = [];

	completionItems.forEach((completionItem, i) => {
		// @ts-ignore
		if (keys.includes(completionItem.label) || completionItem.forceRemove)
			return;

		newCompletionItems.push({
			...completionItem,
			sortText: 'a'.repeat(i + 1)
		});
	});

	return newCompletionItems;
};

const onProvideSuggestions = async ({ textDocument: { uri: fileUri }, position }: TextDocumentPositionParams): Promise<null | CompletionList> => {
	try {
		if (fileIsOutsideScope(fileUri) || isLastQuote(fileUri, position))
			return null;

		const nodes = await buildDummyNodes(fileUri, position);
		if (!nodes) 
			return null;

		const nodeMatchData = findNodeMatchDataFromFilePosition(fileUri, nodes, position);
		if (!nodeMatchData)
			return null;
		
		const completionItems = await buildCompletionItems(nodes, nodeMatchData);

		const filteredCompletionItems = buildFilteredCompletionItems(nodes, nodeMatchData, completionItems);
		if (!filteredCompletionItems.length)
			return null;

		return {
			isIncomplete: false,
			items: filteredCompletionItems
		};
	} catch (e) {
		return null;
	}
};

export default onProvideSuggestions;
