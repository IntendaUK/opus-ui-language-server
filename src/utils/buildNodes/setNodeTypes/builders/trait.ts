// Utils
import { getNodeParent } from '../../../nodeRetrievalUtils';
import { ancestorHasType, nodeHasType } from '../utils';

// Config
import { NODE_TYPES } from '../config';

// Model
import type { Node, Nodes } from '../../../../model';

//Helper
const setTraitTypes = (node: Node, nodes: Nodes) => {
	const result = node.types;

	const parentNode: null | Node = getNodeParent(node, nodes);

	//TRAITS_ARRAY
	if (
		(
			node.name === 'traits' &&
			nodeHasType(parentNode, NODE_TYPES.COMPONENT)
		) ||
		(
			node.name === 'traitsTreeNode' &&
			nodeHasType(parentNode, NODE_TYPES.PRPS_OBJECT)
		)
	)
		result.push(NODE_TYPES.TRAITS_ARRAY);

	//TRAIT
	if (nodeHasType(parentNode, NODE_TYPES.TRAITS_ARRAY))
		result.push(NODE_TYPES.TRAIT);

	//TRAIT_KEY
	if (
		node.name === 'trait' &&
		(
			nodeHasType(parentNode, NODE_TYPES.TRAIT) ||
			nodeHasType(parentNode, NODE_TYPES.COMPONENT)
		)
	)
		result.push(NODE_TYPES.TRAIT_KEY);

	//TRAIT_PRPS
	if (
		node.name === 'traitPrps' &&
		(
			nodeHasType(parentNode, NODE_TYPES.TRAIT) ||
			nodeHasType(parentNode, NODE_TYPES.COMPONENT)
		)
	)
		result.push(NODE_TYPES.TRAIT_PRPS);

	//TRAIT_PRP
	if (nodeHasType(parentNode, NODE_TYPES.TRAIT_PRPS))
		result.push(NODE_TYPES.TRAIT_PRP);

	//TRAIT_SUB_PRP
	if (ancestorHasType(parentNode, nodes, NODE_TYPES.TRAIT_PRP))
		result.push(NODE_TYPES.TRAIT_SUB_PRP);

	//TRAIT_CONDITION
	if (
		node.name === 'condition' &&
		nodeHasType(parentNode, NODE_TYPES.TRAIT)
	) {
		result.push(NODE_TYPES.TRAIT_CONDITION);
		result.push(NODE_TYPES.CONDITION);
	}

	//TRAIT_ACCEPT_PRPS
	if (
		node.name === 'acceptPrps' &&
		nodeHasType(parentNode, NODE_TYPES.TRAIT_DEFINITION)
	)
		result.push(NODE_TYPES.TRAIT_ACCEPT_PRPS);

	//TRAIT_CONFIG
	if (
		node.name === 'traitConfig' &&
		nodeHasType(parentNode, NODE_TYPES.TRAIT_DEFINITION)
	)
		result.push(NODE_TYPES.TRAIT_ACCEPT_PRPS);

	//TRAIT_ACCEPT_PRP
	if (nodeHasType(parentNode, NODE_TYPES.TRAIT_ACCEPT_PRPS))
		result.push(NODE_TYPES.TRAIT_ACCEPT_PRP);

	//TRAIT_ACCEPT_SUB_PRP
	if (ancestorHasType(parentNode, nodes, NODE_TYPES.TRAIT_ACCEPT_PRP))
		result.push(NODE_TYPES.TRAIT_ACCEPT_SUB_PRP);
};

export default setTraitTypes;
