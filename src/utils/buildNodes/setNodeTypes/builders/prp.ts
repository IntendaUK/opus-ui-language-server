// Config
import { NODE_TYPES } from '../config';

// Utils
import { getNodeParent } from '../../../nodeRetrievalUtils';
import { ancestorHasType, nodeHasType } from '../utils';

// Model
import type { Node, Nodes } from '../../../../model';

// Implementation
const setPrpTypes = (node: Node, nodes: Nodes) => {
	const result = node.types;

	const parentNode: null | Node = getNodeParent(node, nodes);

	//PRP
	if (nodeHasType(parentNode, NODE_TYPES.PRPS_OBJECT))
		result.push(NODE_TYPES.PRP);

	//SUB_PRP
	if (ancestorHasType(parentNode, nodes, NODE_TYPES.PRP))
		result.push(NODE_TYPES.SUB_PRP);

	//FLOWS_ARRAY
	if (
		node.name === 'flows' &&
		nodeHasType(parentNode, NODE_TYPES.PRPS_OBJECT)
	)
		result.push(NODE_TYPES.FLOWS_ARRAY);

	//FLOW
	if (nodeHasType(parentNode, NODE_TYPES.FLOWS_ARRAY))
		result.push(NODE_TYPES.FLOW);
};

export default setPrpTypes;
