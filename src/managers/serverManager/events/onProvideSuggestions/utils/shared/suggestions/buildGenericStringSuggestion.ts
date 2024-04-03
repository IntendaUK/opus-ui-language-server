// Utils
import buildCompletionItem from '../../buildCompletionItem';

// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { Node, Nodes } from '../../../../../../../model';

// Implementation
const buildGenericStringSuggestion = (node: Node, nodes: Nodes, type: 'KEY' | 'VALUE' = 'VALUE'): CompletionItem => {
	const completionItem = buildCompletionItem(
		node,
		type,
		'""',
		'string',
		null,
		'string',
		null,
		nodes
	);

	return completionItem;
};

export default buildGenericStringSuggestion;
