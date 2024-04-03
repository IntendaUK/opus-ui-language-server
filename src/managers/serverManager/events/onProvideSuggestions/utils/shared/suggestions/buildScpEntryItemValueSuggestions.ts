// Helpers
import { isArray } from '../../../../../../../utils/utils';
import buildCompletionItem from '../../buildCompletionItem';
import buildSuggestionDocumentationWithSpec from '../utils/buildSuggestionDocumentationWithSpec';

// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { Node, Nodes, ScpEntryConfig, ScpEntryItemConfig } from '../../../../../../../model';

// Local Helpers
const buildSuggestionForKeyOptions = (node: Node, nodes: Nodes, scpEntryItemConfig: ScpEntryItemConfig): CompletionItem[] => {
	const completionItems = scpEntryItemConfig.options!.map(scpEntryItemOptionConfig => {
		const { key, type, desc, spec } = scpEntryItemOptionConfig;

		const documentation = buildSuggestionDocumentationWithSpec(desc, spec);

		const completionItem = buildCompletionItem(node, 'VALUE', key, type, null, type, documentation, nodes);

		return completionItem;
	});

	return completionItems;
};

const buildSuggestionsForKey = (node: Node, nodes: Nodes, scpEntryItemConfig: ScpEntryItemConfig): CompletionItem[] => {
	const completionItems: CompletionItem[] = [];

	const documentation = buildSuggestionDocumentationWithSpec(scpEntryItemConfig.desc, scpEntryItemConfig.spec);

	const types = isArray(scpEntryItemConfig.type) ? scpEntryItemConfig.type as string[] : [scpEntryItemConfig.type as string];

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
const buildScpEntryItemValueSuggestions = (node: Node, nodes: Nodes, config: ScpEntryConfig): null | CompletionItem | CompletionItem[] => {
	const scpEntryItemConfig = config.keys.find(k => k.key === node.name);
	if (!scpEntryItemConfig)
		return null;

	if (scpEntryItemConfig.options) 
		return buildSuggestionForKeyOptions(node, nodes, scpEntryItemConfig);

	const completionItems: CompletionItem[] = buildSuggestionsForKey(node, nodes, scpEntryItemConfig);

	return completionItems;
};

export default buildScpEntryItemValueSuggestions;
