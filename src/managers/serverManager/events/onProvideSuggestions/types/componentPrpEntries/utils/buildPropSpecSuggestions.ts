// Utils
import buildCompletionItem from '../../../utils/buildCompletionItem';
import buildGenericBooleanSuggestion from '../../../utils/shared/suggestions/buildGenericBooleanSuggestion';
import buildGenericArraySuggestion from '../../../utils/shared/suggestions/buildGenericArraySuggestion';
import buildGenericObjectSuggestion from '../../../utils/shared/suggestions/buildGenericObjectSuggestion';
import buildGenericStringSuggestion from '../../../utils/shared/suggestions/buildGenericStringSuggestion';

// Model
import type { ComponentPropSpecs, PropSpec } from '../../../../../../../model';
import type { CompletionItem } from 'vscode-languageserver';
import type { Node, Nodes } from '../../../../../../../model';

// Helpers
const buildOptionsCompletionItems = (node: Node, nodes: Nodes, propSpec: PropSpec) => {
	const { options, type } = propSpec;

	const optionsDelta: string[] = [];

	if (options)
		optionsDelta.push(...options);

	if (!optionsDelta.length)
		return null;

	const completionItems: CompletionItem[] = optionsDelta.map((option: string) => buildCompletionItem(
		node,
		'VALUE',
		option,
		null,
		null,
		type,
		propSpec.desc,
		nodes
	));

	return completionItems;
};

// Implementation
const buildPropSpecSuggestions = (componentPropSpecs: ComponentPropSpecs, node: Node, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	const propSpec: null | PropSpec = componentPropSpecs.get(node.name) || null;

	if (!propSpec)
		return null;

	const { options, type } = propSpec;

	if (options && options.length)
		return buildOptionsCompletionItems(node, nodes, propSpec);
	else if (type === 'boolean')
		return buildGenericBooleanSuggestion(node, nodes);
	else if (type === 'array')
		return buildGenericArraySuggestion(node, nodes);
	else if (type === 'object')
		return buildGenericObjectSuggestion(node, nodes);
	else if (type === 'string')
		return buildGenericStringSuggestion(node, nodes);

	return null;
};

export default buildPropSpecSuggestions;
