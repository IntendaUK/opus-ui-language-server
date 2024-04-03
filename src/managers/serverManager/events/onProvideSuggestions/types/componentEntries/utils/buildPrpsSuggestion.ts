// Utils
import buildCompletionItem from '../../../utils/buildCompletionItem';

// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { Node, Nodes } from '../../../../../../../model';

// Implementation
const buildPrpsSuggestion = (node: Node, nodes: Nodes): null | CompletionItem[] => {
	const completionItem = buildCompletionItem(
		node,
		'VALUE',
		'{}',
		'array',
		null,
		'object',
		null,
		nodes
	);

	return [completionItem];
};

export default buildPrpsSuggestion;
