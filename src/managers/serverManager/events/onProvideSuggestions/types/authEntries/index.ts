// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';
import type { Node, Nodes } from '../../../../../../model';

// Utils
import buildCompletionItem from '../../utils/buildCompletionItem';

// Internal Utils
const buildAuthSuggestions = (node: Node, nodes: Nodes): null | CompletionItem[] => {
	const parentNode = nodes.get(`${node.parentPath}`) || null;
	if (!parentNode)
		return null;

	const prpsNode = nodes.get(`${parentNode.parentPath}/prps`);
	if (!prpsNode || prpsNode.value === null)
		return null;

	const authPropOptions = Object.keys(prpsNode.value);

	const completionItems: CompletionItem[] = authPropOptions.map(authProp => {
		return buildCompletionItem(node, 'VALUE', authProp, 'string', null, 'string', null, nodes);
	});

	return completionItems;
};

// Implementation
const buildComponentPropSuggestions = (nodeMatchData: NodeMatchData, nodes: Nodes): null | CompletionItem[] => {
	const { node } = nodeMatchData!;
	
	const completionItems: null | CompletionItem[] = buildAuthSuggestions(node, nodes);

	return completionItems;
};

export default buildComponentPropSuggestions;
