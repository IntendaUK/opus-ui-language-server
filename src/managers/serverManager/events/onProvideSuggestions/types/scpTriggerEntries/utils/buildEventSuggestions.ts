// Utils
import buildCompletionItem from '../../../utils/buildCompletionItem';

// Model
import type { Node, Nodes } from '../../../../../../../model';
import type { CompletionItem } from 'vscode-languageserver';

// Managers
import ServerManager from '../../../../../index';

// Implementation
const buildEventSuggestions = (node: Node, nodes: Nodes): CompletionItem[] => {
	const completionItems: CompletionItem[] = Array.from(ServerManager.caches.opusTriggersMap.values()).map(entry => buildCompletionItem(
		node,
		'VALUE',
		entry.key,
		entry.type,
		null,
		entry.type,
		entry.desc,
		nodes
	));

	return completionItems;
};

export default buildEventSuggestions;
