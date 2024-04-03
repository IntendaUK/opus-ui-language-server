// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { Node, Nodes } from '../../../../../../model';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';

// Utils
import buildCompletionItem from '../../utils/buildCompletionItem';
import buildGenericArraySuggestion from '../../utils/shared/suggestions/buildGenericArraySuggestion';
import buildGenericStringSuggestion from '../../utils/shared/suggestions/buildGenericStringSuggestion';

// Internals
import { scpEntries } from './config';

// Internal Utils
const buildKeyCompletionItems = (node: Node, nodes: Nodes): CompletionItem[] => {
	const completionItems = scpEntries.map(e => {
		const completionItem: CompletionItem = buildCompletionItem(node, 'KEY', e.key, null, e.type, e.type, e.desc, nodes);

		return completionItem;
	});

	return completionItems;
};

const buildValueCompletionItems = (node: Node, nodes: Nodes): null | CompletionItem => {
	if (node.name === 'id')
		return buildGenericStringSuggestion(node, nodes);

	if (node.name === 'triggers')
		return buildGenericArraySuggestion(node, nodes);

	if (node.name === 'actions')
		return buildGenericArraySuggestion(node, nodes);

	return null;
};

// Implementation
const buildScpPropSuggestions = (nodeMatchData: NodeMatchData, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	const { matchedOn, node } = nodeMatchData!;

	let completionItems: null | CompletionItem | CompletionItem[] = null;

	if (matchedOn === 'KEY')
		completionItems = buildKeyCompletionItems(node, nodes);
	else if (matchedOn === 'VALUE')
		completionItems = buildValueCompletionItems(node, nodes);

	return completionItems;
};

export default buildScpPropSuggestions;
