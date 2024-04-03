// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';
import type { Nodes, Node, TraitDefinitionAcceptPrpsData, SanitisedTraitDefinitionAcceptPrps, JSONObject } from '../../../../../../model';

// Utils
import { getTraitDataFromTraitValue } from '../../../../../../utils/nodeValueRetrievalUtils';
import { getTraitDefinitionNodeFromTraitDefinitionPathDelta, getNodeParent } from '../../../../../../utils/nodeRetrievalUtils';
import buildCompletionItem from '../../utils/buildCompletionItem';
import getAcceptPrpsFromTraitDefinitionValue from '../../../../../../utils/nodeValueRetrievalUtils/getAcceptPrpsFromTraitDefinitionValue';
import buildGenericArraySuggestion from '../../utils/shared/suggestions/buildGenericArraySuggestion';
import buildGenericBooleanSuggestion from '../../utils/shared/suggestions/buildGenericBooleanSuggestion';
import buildGenericObjectSuggestion from '../../utils/shared/suggestions/buildGenericObjectSuggestion';
import buildGenericStringSuggestion from '../../utils/shared/suggestions/buildGenericStringSuggestion';

// Internal Utils
const buildKeyCompletionItems = (traitDefinitionAcceptPrps: SanitisedTraitDefinitionAcceptPrps, node: Node, nodes: Nodes): CompletionItem[] => {
	const traitDefinitionAcceptPrpEntries = Object.entries(traitDefinitionAcceptPrps);

	const completionItems: CompletionItem[] = traitDefinitionAcceptPrpEntries
		.map(([traitPrpKey, traitPrpData]) => {
			return buildCompletionItem(
				node,
				'KEY',
				traitPrpKey,
				null,
				traitPrpData.type,
				traitPrpData.type,
				traitPrpData.desc,
				nodes
			);
		});

	return completionItems;
};

const buildValueCompletionItems = (traitDefinitionAcceptPrps: SanitisedTraitDefinitionAcceptPrps, node: Node, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	const { type } = traitDefinitionAcceptPrps[node.name];

	if (type === 'string')
		return buildGenericStringSuggestion(node, nodes);

	if (type === 'object')
		return buildGenericObjectSuggestion(node, nodes);

	else if (type === 'array')
		return buildGenericArraySuggestion(node, nodes);

	else if (type === 'boolean')
		return buildGenericBooleanSuggestion(node, nodes);

	return null;
};

// Implementation
const buildTraitPrpSuggestions = (nodeMatchData: NodeMatchData, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	const { matchedOn, node } = nodeMatchData!;

	const traitData = getTraitDataFromTraitValue(getNodeParent(getNodeParent(node, nodes)!, nodes)!.value as JSONObject);
	if (!traitData)
		return null;

	const { trait } = traitData;
	
	const traitDefinitionNode: null | Node = getTraitDefinitionNodeFromTraitDefinitionPathDelta(trait, node.filePath!);
	if (!traitDefinitionNode)
		return null;

	const traitDefinitionAcceptPrps: TraitDefinitionAcceptPrpsData = getAcceptPrpsFromTraitDefinitionValue(traitDefinitionNode.value);
	if (!traitDefinitionAcceptPrps)
		return null;

	let completionItems: null | CompletionItem | CompletionItem[] = null;

	if (matchedOn === 'KEY')
		completionItems = buildKeyCompletionItems(traitDefinitionAcceptPrps, node, nodes);
	else if (matchedOn === 'VALUE')
		completionItems = buildValueCompletionItems(traitDefinitionAcceptPrps, node, nodes);

	return completionItems;
};

export default buildTraitPrpSuggestions;
