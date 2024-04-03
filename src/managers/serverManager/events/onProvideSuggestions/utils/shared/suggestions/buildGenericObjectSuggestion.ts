// Utils
import buildCompletionItem from '../../buildCompletionItem';

// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { Node, Nodes } from '../../../../../../../model';

// Implementation
const buildGenericObjectSuggestion = (node: Node, nodes: Nodes, type: 'KEY' | 'VALUE' = 'VALUE'): CompletionItem => {
	const completionItem = buildCompletionItem(
		node,
		type,
		'{}',
		'object',
		null,
		'object',
		null,
		nodes
	);

	return completionItem;
};

export default buildGenericObjectSuggestion;
