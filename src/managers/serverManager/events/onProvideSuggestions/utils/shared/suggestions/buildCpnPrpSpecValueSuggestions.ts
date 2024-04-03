// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { Node, Nodes } from '../../../../../../../model';
import type { SourceTargetKey } from '../../../../../../../utils/nodeRetrievalUtils/getSourceNodeOrTargetNode';
import type { PropSpecEntry } from '../utils/buildSourceOrTargetNodePropSpecEntries';

// Helpers
import { isArray } from '../../../../../../../utils/utils';
import { getPropertyValueFromParentNodeValue } from '../../../../../../../utils/nodeValueRetrievalUtils';
import buildCompletionItem from '../../buildCompletionItem';
import getSourceNodeOrTargetNode from '../../../../../../../utils/nodeRetrievalUtils/getSourceNodeOrTargetNode';
import buildSourceOrTargetNodePropSpecEntries from '../utils/buildSourceOrTargetNodePropSpecEntries';
import buildSuggestionDocumentationWithSpec from '../utils/buildSuggestionDocumentationWithSpec';
import buildGenericStringSuggestion from './buildGenericStringSuggestion';

// Helpers
const buildSuggestionsForPropSpecEntryOptions = (node: Node, nodes: Nodes, propSpecEntry: PropSpecEntry): CompletionItem[] => {
	const { desc, spec } = propSpecEntry;

	const completionItems = propSpecEntry.options!.map(option => {

		const documentation = buildSuggestionDocumentationWithSpec(desc, spec);

		const completionItem = buildCompletionItem(node, 'VALUE', option, 'string', null, 'string', documentation, nodes);

		return completionItem;
	});

	return completionItems;
};

const buildSuggestionsForPropSpecEntry = (node: Node, nodes: Nodes, propSpecEntry: PropSpecEntry): CompletionItem[] => {
	const completionItems: CompletionItem[] = [];

	const documentation = buildSuggestionDocumentationWithSpec(propSpecEntry.desc, propSpecEntry.spec);

	const types = isArray(propSpecEntry.type) ? propSpecEntry.type as string[] : [propSpecEntry.type as string];

	types.forEach(type => {
		if (type === 'string')
			completionItems.push(buildCompletionItem(node, 'VALUE', '""', type, null, type, documentation, nodes));

		if (type === 'object')
			completionItems.push(buildCompletionItem(node, 'VALUE', '{}', type, null, type, documentation, nodes));

		if (type === 'array')
			completionItems.push(buildCompletionItem(node, 'VALUE', '[]', type, null, type, documentation, nodes));

		if (type === 'boolean') {
			completionItems.push(
				buildCompletionItem(node, 'VALUE', 'true', type, null, type, documentation, nodes),
				buildCompletionItem(node, 'VALUE', 'false', type, null, type, documentation, nodes)
			);
		}
	});

	return completionItems;
};

// Implementation
const buildCpnPrpSpecValueSuggestions = async (node: Node, nodes: Nodes, key: SourceTargetKey): Promise<null | CompletionItem |CompletionItem[]> => {
	const sourceOrTargetNode = getSourceNodeOrTargetNode(node, nodes, key);
	if (!sourceOrTargetNode)
		return null;

	const propKey = getPropertyValueFromParentNodeValue(node, nodes, 'key', 'string');
	if (!propKey)
		return buildGenericStringSuggestion(node, nodes);

	const sourceOrTargetNodePropSpecEntries: PropSpecEntry[] = await buildSourceOrTargetNodePropSpecEntries(sourceOrTargetNode, nodes);

	const propSpecEntry: null | PropSpecEntry = sourceOrTargetNodePropSpecEntries.find(e => e.key === propKey) || null;
	if (!propSpecEntry)
		return null;

	if (propSpecEntry.options)
		return buildSuggestionsForPropSpecEntryOptions(node, nodes, propSpecEntry);

	return buildSuggestionsForPropSpecEntry(node, nodes, propSpecEntry);
};

export default buildCpnPrpSpecValueSuggestions;
