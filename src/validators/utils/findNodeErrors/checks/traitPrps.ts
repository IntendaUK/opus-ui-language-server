// Utils
import getAcceptPrpsFromTraitDefinitionValue from '../../../../utils/nodeValueRetrievalUtils/getAcceptPrpsFromTraitDefinitionValue';
import { getTraitDataFromTraitValue } from '../../../../utils/nodeValueRetrievalUtils';
import { getTraitDefinitionNodeFromTraitDefinitionPathDelta, getNodeParent } from '../../../../utils/nodeRetrievalUtils';
import { nodeHasType } from '../../../../utils/buildNodes/setNodeTypes/utils';

// Model
import type { TraitDefinitionAcceptPrpsData, Nodes, Node, NodeError } from '../../../../model';

// Config
import { NODE_TYPES } from '../../../../utils/buildNodes/setNodeTypes/config';

//Internals
const errorType = 'Trait';

// Implementation
const traitPrps = (nodes: Nodes, node: Node, errors: NodeError[]) => {
	if (!nodeHasType(node, NODE_TYPES.TRAIT_PRPS) || nodeHasType(node, NODE_TYPES.BRACKET_END))
		return;

	const traitData = getTraitDataFromTraitValue(getNodeParent(node, nodes)!.value);
	if (!traitData)
		return;

	const { trait, traitPrps } = traitData;
	if (!traitPrps)
		return;

	const traitDefinitionNode: null | Node = getTraitDefinitionNodeFromTraitDefinitionPathDelta(trait, node.filePath!);
	if (!traitDefinitionNode)
		return;

	const traitDefinitionAcceptPrps: TraitDefinitionAcceptPrpsData = getAcceptPrpsFromTraitDefinitionValue(traitDefinitionNode.value);
	if (!traitDefinitionAcceptPrps)
		return;

	const unimplementedTraitPrpKeys = Object
		.keys(traitDefinitionAcceptPrps)
		.filter(acceptPrpKey => traitPrps[acceptPrpKey] === undefined && traitDefinitionAcceptPrps[acceptPrpKey].dft === undefined);

	unimplementedTraitPrpKeys.forEach(unimplementedTraitPrpKey => {
		errors.push({
			errorType,
			message: `Required traitPrp: "${unimplementedTraitPrpKey}" is unimplemented.`,
			erroredIn: 'KEY',
			errorSolution: 'UNKNOWN',
			severity: 1,
			node
		});
	});
};

export const check = traitPrps;
