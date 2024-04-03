// Utils
import buildCompletionItem from '../../buildCompletionItem';

// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { Node, Nodes } from '../../../../../../../model';

// Implementation
const buildGenericArraySuggestion = (node: Node, nodes: Nodes, type: 'KEY' | 'VALUE' = 'VALUE'): CompletionItem => {
	const completionItem = buildCompletionItem(
		node,
		type,
		'[]',
		'array',
		null,
		'array',
		null,
		nodes
	);

	return completionItem;
};

export default buildGenericArraySuggestion;
