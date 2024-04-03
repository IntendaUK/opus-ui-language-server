// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';
import type { Node, Nodes } from '../../../../../../model';

// Utils
import buildCompletionItem from '../../utils/buildCompletionItem';
import buildGenericStringSuggestion from '../../utils/shared/suggestions/buildGenericStringSuggestion';
import buildIdSuggestions from '../../utils/shared/suggestions/buildIdSuggestions';
import buildCpnPrpKeyFromKeyOrToKeySuggestions from '../../utils/shared/suggestions/buildCpnPrpKeyFromKeyOrToKeySuggestions';

// Internals
const flowEntries = [
	{ key: 'from', desc: 'The id of the component to flow from.', type: 'string' },
	{ key: 'fromKey', desc: 'The property key to flow from.', type: 'string' },
	{ key: 'fromSubKey', desc: 'The property subKey to flow from', type: 'string' },
	{ key: 'to', desc: 'The id of the component to flow to.', type: 'string' },
	{ key: 'toKey', desc: 'The property key to flow to.', type: 'string' },
	{ key: 'toSubKey', desc: 'The property subKey to flow to.', type: 'string' },
	{ key: 'mapFunctionString', desc: 'A custom javascript function (written inside quotes) to convert the value before it is flowed to the component.', type: 'string' }
];

// Internal Utils
const buildKeyCompletionItems = (node: Node, nodes: Nodes): CompletionItem[] => {
	const completionItems = flowEntries.map(e => {
		const completionItem: CompletionItem = buildCompletionItem(node, 'KEY', e.key, null, e.type, e.type, e.desc, nodes);

		return completionItem;
	});

	return completionItems;
};

const buildValueCompletionItems = async (node: Node, nodes: Nodes): Promise<CompletionItem | CompletionItem[]> => {
	let suggestions: null | CompletionItem | CompletionItem[] = null;

	if (node.name === 'from')
		suggestions = buildIdSuggestions(node, nodes);
	else if (node.name === 'fromKey')
		suggestions = await buildCpnPrpKeyFromKeyOrToKeySuggestions(node, nodes, 'from');
	else if (node.name === 'fromSubKey')
		suggestions = await buildCpnPrpKeyFromKeyOrToKeySuggestions(node, nodes, 'from', 'fromKey');
	else if (node.name === 'to')
		suggestions = buildIdSuggestions(node, nodes);
	else if (node.name === 'toKey')
		suggestions = await buildCpnPrpKeyFromKeyOrToKeySuggestions(node, nodes, 'to');
	else if (node.name === 'toSubKey')
		suggestions = await buildCpnPrpKeyFromKeyOrToKeySuggestions(node, nodes, 'to', 'toKey');
	else if (node.name === 'mapFunctionString')
		suggestions = buildGenericStringSuggestion(node, nodes);

	if (suggestions === null || !(suggestions as CompletionItem[]).length)
		return buildGenericStringSuggestion(node, nodes);

	return suggestions;
};

// Implementation
const buildFlowPropSuggestions = async (nodeMatchData: NodeMatchData, nodes: Nodes): Promise<CompletionItem | CompletionItem[]> => {
	const { matchedOn, node } = nodeMatchData!;

	if (matchedOn === 'KEY')
		return buildKeyCompletionItems(node, nodes);

	return await buildValueCompletionItems(node, nodes);
};

export default buildFlowPropSuggestions;
