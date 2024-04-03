// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';
import type { Nodes, Node } from '../../../../../../model';

// Utils
import buildCompletionItem from '../../utils/buildCompletionItem';
import buildGenericArraySuggestion from '../../utils/shared/suggestions/buildGenericArraySuggestion';
import buildGenericBooleanSuggestion from '../../utils/shared/suggestions/buildGenericBooleanSuggestion';
import buildGenericObjectSuggestion from '../../utils/shared/suggestions/buildGenericObjectSuggestion';
import buildGenericStringSuggestion from '../../utils/shared/suggestions/buildGenericStringSuggestion';
import buildAcceptPrpTypeSuggestions from './utils/buildAcceptPrpTypeSuggestions';

// Internals
const acceptPrpValueEntries = [
	{ key: 'morph', desc: 'A boolean which tells Opus to use morphActions and morphVariable to calculate this acceptPrp', type: 'boolean' },
	{ key: 'morphId', desc: 'An id which is used as a script accessor inside morphActions', type: 'string' },
	{ key: 'morphVariable', desc: 'The variable name which the morph result is retrieved from', type: 'string' },
	{ key: 'morphActions', desc: 'Script actions used to generate the morphed variable', type: 'array' },
	{ key: 'type', desc: 'The value type of this acceptPrp', type: 'string' },
	{ key: 'desc', desc: 'The description of this traitPrp', type: 'string' },
	{ key: 'dft', desc: 'A default value which will be applied if no traitPrp is passed in the callee trait.', type: 'any' }
];

// Internal Utils
const buildKeyCompletionItems = (node: Node, nodes: Nodes): CompletionItem[] => {
	const completionItems = acceptPrpValueEntries.map(e => {
		const completionItem: CompletionItem = buildCompletionItem(node, 'KEY', e.key, null, e.type, e.type, e.desc, nodes);

		return completionItem;
	});

	return completionItems;
};

const buildValueCompletionItems = (node: Node, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	if (node.name === 'morph')
		return buildGenericBooleanSuggestion(node, nodes);

	if (node.name === 'morphId')
		return buildGenericStringSuggestion(node, nodes);

	if (node.name === 'morphVariable')
		return buildGenericStringSuggestion(node, nodes);

	if (node.name === 'morphActions')
		return buildGenericArraySuggestion(node, nodes);

	if (node.name === 'type')
		return buildAcceptPrpTypeSuggestions(node, nodes);

	if (node.name === 'desc')
		return buildGenericStringSuggestion(node, nodes);

	if (node.name === 'dft') {
		return [
			buildGenericStringSuggestion(node, nodes, 'VALUE'),
			...buildGenericBooleanSuggestion(node, nodes, 'VALUE'),
			buildGenericObjectSuggestion(node, nodes, 'VALUE'),
			buildGenericArraySuggestion(node, nodes, 'VALUE')
		];
	}

	return null;
};

// Implementation
const buildAcceptPrpSuggestions = (nodeMatchData: NodeMatchData, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	const { matchedOn, node } = nodeMatchData!;

	let completionItems: null | CompletionItem | CompletionItem[] = null;

	if (matchedOn === 'KEY')
		completionItems = buildKeyCompletionItems(node, nodes);
	else if (matchedOn === 'VALUE')
		completionItems = buildValueCompletionItems(node, nodes);

	return completionItems;
};

export default buildAcceptPrpSuggestions;
