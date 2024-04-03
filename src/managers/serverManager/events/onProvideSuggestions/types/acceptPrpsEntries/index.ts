// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';
import type { Nodes, Node } from '../../../../../../model';

// Utils
import buildCompletionItem from '../../utils/buildCompletionItem';
import buildGenericStringSuggestion from '../../utils/shared/suggestions/buildGenericStringSuggestion';

// Internals
const acceptPrpValueEntries = [
	{ key: 'string', desc: 'This specifies that this acceptPrp should be of type "string"', type: 'string' },
	{ key: 'boolean', desc: 'This specifies that this acceptPrp should be of type "boolean"', type: 'string' },
	{ key: 'object', desc: 'This specifies that this acceptPrp should be of type "object"', type: 'string' },
	{ key: 'array', desc: 'This specifies that this acceptPrp should be of type "array"', type: 'string' },
	{ key: 'mixed', desc: 'This specifies that this acceptPrp should be of type "any"', type: 'string' },
	{ key: '{}', desc: 'An acceptPrp configuration object', type: 'object' }
];

// Internal Utils
const buildKeyCompletionItems = (node: Node, nodes: Nodes): CompletionItem => {
	return buildGenericStringSuggestion(node, nodes, 'KEY');
};

const buildValueCompletionItems = (node: Node, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	const completionItems = acceptPrpValueEntries.map(e => {
		const completionItem: CompletionItem = buildCompletionItem(node, 'VALUE', e.key, null, e.type, e.type, e.desc, nodes);

		return completionItem;
	});

	return completionItems;
};

// Implementation
const buildAcceptPrpsSuggestions = (nodeMatchData: NodeMatchData, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	const { matchedOn, node } = nodeMatchData!;

	let completionItems: null | CompletionItem | CompletionItem[] = null;

	if (matchedOn === 'KEY')
		completionItems = buildKeyCompletionItems(node, nodes);
	else if (matchedOn === 'VALUE')
		completionItems = buildValueCompletionItems(node, nodes);

	return completionItems;
};

export default buildAcceptPrpsSuggestions;
