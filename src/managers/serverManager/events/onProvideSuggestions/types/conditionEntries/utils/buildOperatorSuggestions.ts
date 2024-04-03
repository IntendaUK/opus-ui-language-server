// Utils
import buildCompletionItem from '../../../utils/buildCompletionItem';

// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { Node, Nodes } from '../../../../../../../model';

// Managers
import ServerManager from '../../../../../index';

// Implementation
const buildOperatorSuggestions = (node: Node, nodes: Nodes): CompletionItem[] => Array.from(ServerManager.caches.opusOperatorsMap.values()).map(e => {
	const completionItem: CompletionItem = buildCompletionItem(
		node,
		'VALUE',
		e.key,
		e.type,
		null,
		e.type,
		e.desc,
		nodes);

	return completionItem;
});

export default buildOperatorSuggestions;
