// Utils
import buildCompletionItem from '../../../utils/buildCompletionItem';

// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { Node, Nodes } from '../../../../../../../model';

// Internals
const acceptPrpTypeEntries = [
	{ key: 'string', desc: 'This specifies that this acceptPrp should be of type "string"', type: 'string' },
	{ key: 'boolean', desc: 'This specifies that this acceptPrp should be of type "boolean"', type: 'string' },
	{ key: 'object', desc: 'This specifies that this acceptPrp should be of type "object"', type: 'string' },
	{ key: 'array', desc: 'This specifies that this acceptPrp should be of type "array"', type: 'string' },
	{ key: 'mixed', desc: 'This specifies that this acceptPrp should be of type "any"', type: 'string' }
];

// Implementation
const buildAcceptPrpTypeSuggestions = (node: Node, nodes: Nodes): CompletionItem[] => {
	const completionItems = acceptPrpTypeEntries.map(e => {
		const completionItem: CompletionItem = buildCompletionItem(node, 'VALUE', e.key, null, e.type, e.type, e.desc, nodes);

		return completionItem;
	});

	return completionItems;
};

export default buildAcceptPrpTypeSuggestions;
