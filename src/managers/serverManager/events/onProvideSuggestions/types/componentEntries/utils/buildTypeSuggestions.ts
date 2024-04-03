// Utils
import buildCompletionItem from '../../../utils/buildCompletionItem';

// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { Node, Nodes } from '../../../../../../../model';

// Managers
import ServerManager from '../../../../../index';

// Implementation
const buildTypeSuggestions = (node: Node, nodes: Nodes): CompletionItem[] => {
	const componentTypes = Object.keys(ServerManager.paths.opusComponentPropSpecPaths).filter(t => t !== 'baseProps');

	const completionItems: CompletionItem[] = componentTypes.map(componentType => {
		return buildCompletionItem(node, 'VALUE', componentType, 'string', null, 'string', null, nodes);
	});

	return completionItems;
};

export default buildTypeSuggestions;
