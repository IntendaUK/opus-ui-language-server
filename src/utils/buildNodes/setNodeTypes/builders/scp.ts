// Config
import { NODE_TYPES } from '../config';

// Utils
import { getNodeParent } from '../../../nodeRetrievalUtils';
import { ancestorHasType, nodeHasType } from '../utils';

// Model
import type { Node, Nodes } from '../../../../model';

// Implementation
const setScpTypes = (node: Node, nodes: Nodes) => {
	const result = node.types;

	const parentNode: null | Node = getNodeParent(node, nodes);

	//SCPS_ARRAY
	if (
		node.name === 'scps' &&
		nodeHasType(parentNode, NODE_TYPES.PRPS_OBJECT)
	)
		result.push(NODE_TYPES.SCPS_ARRAY);

	//SCP
	if (
		nodeHasType(parentNode, NODE_TYPES.SCPS_ARRAY) ||
		(
			node.name === 'fireScript' &&
			nodeHasType(parentNode, NODE_TYPES.PRPS_OBJECT)
		) ||
		(
			node.name === 'dtaScps' &&
			node.valueType === 'object'
		) ||
		(
			parentNode?.name === 'dtaScps' &&
			node.valueType === 'object'
		)
	)
		result.push(NODE_TYPES.SCP);

	//SCP_TRIGGERS_ARRAY
	if (
		node.name === 'triggers' &&
		nodeHasType(parentNode, NODE_TYPES.SCP)
	)
		result.push(NODE_TYPES.SCP_TRIGGERS_ARRAY);

	//SCP_TRIGGER
	if (nodeHasType(parentNode, NODE_TYPES.SCP_TRIGGERS_ARRAY))
		result.push(NODE_TYPES.SCP_TRIGGER);

	//SCP_TRIGGER_MATCH
	if (
		node.name === 'match' &&
		nodeHasType(parentNode, NODE_TYPES.SCP_TRIGGER)
	)
		result.push(NODE_TYPES.SCP_TRIGGER_MATCH);

	//SCP_ACTIONS_ARRAY
	if (
		(
			node.name === 'actions' &&
			nodeHasType(parentNode, NODE_TYPES.SCP)
		) ||
		(
			node.name === 'traitArray' &&
			nodeHasType(parentNode, NODE_TYPES.TRAIT_DEFINITION)
		) ||
		(
			parentNode?.name === 'branch' &&
			nodeHasType(getNodeParent(parentNode, nodes), NODE_TYPES.SCP_ACTION)
		)
	)
		result.push(NODE_TYPES.SCP_ACTIONS_ARRAY);

	//SCP_ACTION
	if (nodeHasType(parentNode, NODE_TYPES.SCP_ACTIONS_ARRAY))
		result.push(NODE_TYPES.SCP_ACTION);

	//SCP_ACTION_ENTRY
	if (nodeHasType(parentNode, NODE_TYPES.SCP_ACTION))
		result.push(NODE_TYPES.SCP_ACTION_ENTRY);

	//SCP_ACTION_SUB_ENTRY
	if (ancestorHasType(parentNode, nodes, NODE_TYPES.SCP_ACTION_ENTRY))
		result.push(NODE_TYPES.SCP_ACTION_SUB_ENTRY);
};

export default setScpTypes;
