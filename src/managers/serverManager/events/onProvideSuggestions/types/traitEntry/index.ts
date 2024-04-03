// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';
import type { Node, Nodes } from '../../../../../../model';

// Utils
import buildCompletionItem from '../../utils/buildCompletionItem';
import buildGenericObjectSuggestion from '../../utils/shared/suggestions/buildGenericObjectSuggestion';
import buildGenericArraySuggestion from '../../utils/shared/suggestions/buildGenericArraySuggestion';
import buildTraitDefinitionPathSuggestions from '../../utils/shared/suggestions/buildTraitDefinitionPathSuggestions';

// Internals
const traitEntries = [
	{ key: 'condition', desc: 'A condition object defining whether this trait should be applied or not', type: 'object' },
	{ key: 'trait', desc: 'The location of the trait to use.', type: 'string' },
	{ key: 'traitPrps', desc: 'Trait properties that will passed into the trait, to be used inside', type: 'object' },
	{ key: 'auth', desc: 'An array of property names that, when redefined by the parent component, will be updated upon remount', type: 'array' }
];

// Internal Utils
const buildKeyCompletionItems = (node: Node, nodes: Nodes): CompletionItem[] => {
	const completionItems = traitEntries.map(e => {
		const completionItem: CompletionItem = buildCompletionItem(node, 'KEY', e.key, null, e.type, e.type, e.desc, nodes);

		return completionItem;
	});

	return completionItems;
};

const buildValueCompletionItems = (node: Node, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	if (node.name === 'condition')
		return buildGenericObjectSuggestion(node, nodes);

	if (node.name === 'trait')
		return buildTraitDefinitionPathSuggestions(node, nodes);

	if (node.name === 'traitPrps')
		return buildGenericObjectSuggestion(node, nodes);

	if (node.name === 'auth')
		return buildGenericArraySuggestion(node, nodes);

	return null;
};

// Implementation
const buildComponentTraitEntrySuggestions = (nodeMatchData: NodeMatchData, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	const { matchedOn, node } = nodeMatchData!;

	let completionItems: null | CompletionItem | CompletionItem[] = null;

	if (matchedOn === 'KEY')
		completionItems = buildKeyCompletionItems(node, nodes);
	else if (matchedOn === 'VALUE')
		completionItems = buildValueCompletionItems(node, nodes);

	return completionItems;
};

export default buildComponentTraitEntrySuggestions;
