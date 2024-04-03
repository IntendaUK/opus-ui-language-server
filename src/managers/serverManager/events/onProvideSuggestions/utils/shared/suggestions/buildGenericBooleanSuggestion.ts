// Utils
import buildCompletionItem from '../../buildCompletionItem';

// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { Node, Nodes } from '../../../../../../../model';

// Implementation
const buildGenericBooleanSuggestion = (node: Node, nodes: Nodes, type: 'KEY' | 'VALUE' = 'VALUE'): CompletionItem[] => {
	const completionItems = [
		buildCompletionItem(
			node,
			type,
			'true',
			'boolean',
			null,
			'boolean',
			null,
			nodes
		),
		buildCompletionItem(
			node,
			type,
			'false',
			'boolean',
			null,
			'boolean',
			null,
			nodes
		)
	];

	return completionItems;
};

export default buildGenericBooleanSuggestion;
