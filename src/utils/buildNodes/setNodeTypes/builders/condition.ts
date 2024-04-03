// Config
import { NODE_TYPES } from '../config';

// Utils
import { getNodeParent } from '../../../nodeRetrievalUtils';
import { ancestorHasType, nodeHasType } from '../utils';

// Model
import type { Node, Nodes } from '../../../../model';

// Implementation
const setConditionTypes = (node: Node, nodes: Nodes) => {
	const result = node.types;

	const parentNode: null | Node = getNodeParent(node, nodes);

	//CONDITION
	if (
		node.valueType === 'object' &&
		nodeHasType(parentNode, NODE_TYPES.CONDITION_ARRAY)
	)
		result.push(NODE_TYPES.CONDITION);

	//CONDITION_ARRAY
	if (
		node.valueType === 'array' &&
		(
			node.name === 'comparisons' ||
			node.name === 'match'
		)
	)
		result.push(NODE_TYPES.CONDITION_ARRAY);

	//CONDITION_SUB_ENTRY
	if (ancestorHasType(parentNode, nodes, NODE_TYPES.CONDITION))
		result.push(NODE_TYPES.CONDITION_SUB_ENTRY);
};

export default setConditionTypes;
