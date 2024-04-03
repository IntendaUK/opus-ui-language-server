// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';
import type { Nodes } from '../../../../../../model';
import type { ComponentPropSpecs, Node } from '../../../../../../model';

// Utils
import getComponentNodePropSpecs from '../../../../../../utils/propSpecs/getComponentNodePropSpecs';
import buildCompletionItem from '../../utils/buildCompletionItem';
import buildPropSpecSuggestions from './utils/buildPropSpecSuggestions';

// Internal Utils
const buildKeyCompletionItems = (componentPropSpecs: ComponentPropSpecs, node: Node, nodes: Nodes): CompletionItem[] => {
	const componentPropSpecEntries = Array.from(componentPropSpecs.entries());

	const completionItems: CompletionItem[] = componentPropSpecEntries
		.filter(t => !t[1].internal)
		.map(([propKey, propSpec]) => buildCompletionItem(
			node,
			'KEY',
			propKey,
			propSpec.type,
			propSpec.component,
			propSpec.type,
			propSpec.desc,
			nodes
		));

	return completionItems;
};

const buildValueCompletionItems = (componentPropSpecs: ComponentPropSpecs, node: Node, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	return buildPropSpecSuggestions(componentPropSpecs, node, nodes);
};

// Implementation
const buildComponentPrpSuggestions = async (nodeMatchData: NodeMatchData, nodes: Nodes): Promise<null | CompletionItem | CompletionItem[]> => {
	const componentPropSpecs = await getComponentNodePropSpecs(nodeMatchData.node, nodes);
	if (!componentPropSpecs)
		return null;

	const { matchedOn, node } = nodeMatchData!;

	let completionItems: null | CompletionItem | CompletionItem[] = null;

	if (matchedOn === 'KEY')
		completionItems = buildKeyCompletionItems(componentPropSpecs, node, nodes);
	else if (matchedOn === 'VALUE')
		completionItems = buildValueCompletionItems(componentPropSpecs, node, nodes);

	return completionItems;
};

export default buildComponentPrpSuggestions;
