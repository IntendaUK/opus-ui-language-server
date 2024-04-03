// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';
import type { Node, Nodes } from '../../../../../../model';

// Utils
import buildCompletionItem from '../../utils/buildCompletionItem';
import buildGenericArraySuggestion from '../../utils/shared/suggestions/buildGenericArraySuggestion';

// Internals
const entries = [
	{ key: '""', desc: null, type: 'string' },
	{ key: 'true', desc: 'The chain of actions when the condition resolves to true', type: 'string' },
	{ key: 'false', desc: 'The chain of actions when the condition resolves to false', type: 'string' }
];

// Internal Utils
const buildKeyCompletionItems = (node: Node, nodes: Nodes): CompletionItem[] => {
	const completionItems = entries.map(e => {
		const completionItem: CompletionItem = buildCompletionItem(node, 'KEY', e.key, null, e.type, e.type, e.desc, nodes);

		return completionItem;
	});

	return completionItems;
};

const buildValueCompletionItems = (node: Node, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	return buildGenericArraySuggestion(node, nodes);
};

// Implementation
const buildBranchEntrySuggestions = (nodeMatchData: NodeMatchData, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	const { matchedOn, node } = nodeMatchData!;

	let completionItems: null | CompletionItem | CompletionItem[] = null;

	if (matchedOn === 'KEY')
		completionItems = buildKeyCompletionItems(node, nodes);
	else if (matchedOn === 'VALUE')
		completionItems = buildValueCompletionItems(node, nodes);

	return completionItems;
};

export default buildBranchEntrySuggestions;
