//Utils
import { getNodeParent } from '../../../nodeRetrievalUtils';
import { countProperties, nodeHasType } from '../utils';

// Config
import { NODE_TYPES, NODE_PROPERTIES, NODE_PROPERTIES_NEEDED } from '../config';

// Model
import type { JSONObject, Node, Nodes } from '../../../../model';

//Helper
const setComponentType = (node: Node, nodes: Nodes) => {
	const result = node.types;

	const parentNode: null | Node = getNodeParent(node, nodes);

	if (nodeHasType(parentNode, NODE_TYPES.COMPONENT))
		result.push(NODE_TYPES.COMPONENT_ENTRY);

	if (nodeHasType(parentNode, NODE_TYPES.COMPONENT) && node.name === 'scope')
		result.push(NODE_TYPES.COMPONENT_SCOPE);

	if (nodeHasType(parentNode, NODE_TYPES.COMPONENT) && node.name === 'id')
		result.push(NODE_TYPES.COMPONENT_ID);

	if (nodeHasType(parentNode, NODE_TYPES.COMPONENT) && node.name === 'relId')
		result.push(NODE_TYPES.COMPONENT_RELATIVE_ID);

	if (nodeHasType(parentNode, NODE_TYPES.COMPONENT) && node.name === 'type')
		result.push(NODE_TYPES.COMPONENT_TYPE);

	//COMPONENT
	if (
		nodeHasType(parentNode, NODE_TYPES.WGTS_ARRAY) ||
			countProperties(node.value, NODE_PROPERTIES.COMPONENT) >= NODE_PROPERTIES_NEEDED.COMPONENT ||
			(
				node.name === 'value' &&
				nodeHasType(parentNode, NODE_TYPES.SCP_ACTION) &&
				parentNode?.value &&
				(parentNode?.value as JSONObject).type === 'setState' &&
				(parentNode?.value as JSONObject).key === 'extraWgts' &&
				node.valueType === 'object'
			) ||
			(
				node.name === 'rowMda' &&
				nodeHasType(parentNode, NODE_TYPES.PRPS_OBJECT)
			) ||
			(
				node.name === 'mdaLabel' &&
				nodeHasType(parentNode, NODE_TYPES.PRPS_OBJECT)
			) ||
			(
				node.name === 'popoverMda' &&
				node.valueType === 'object' &&
				nodeHasType(parentNode, NODE_TYPES.PRPS_OBJECT)
			) ||
			(
				node.name === 'tooltipMda' &&
				node.valueType === 'object' &&
				nodeHasType(parentNode, NODE_TYPES.PRPS_OBJECT)
			)
	) {
		if (!nodeHasType(node, NODE_TYPES.BRACKET_END))
			result.push(NODE_TYPES.COMPONENT);
	}

	//COMPONENT_AUTH_ARRAY
	if (
		node.name === 'auth' &&
		node.valueType === 'array' &&
		nodeHasType(parentNode, NODE_TYPES.COMPONENT)
	)
		result.push(NODE_TYPES.COMPONENT_AUTH_ARRAY);

	if (nodeHasType(parentNode, NODE_TYPES.COMPONENT_AUTH_ARRAY))
		result.push(NODE_TYPES.COMPONENT_AUTH_ARRAY_ENTRY);

	//COMPONENT_CONDITION
	if (
		node.name === 'condition' &&
		nodeHasType(parentNode, NODE_TYPES.COMPONENT)
	) {
		result.push(NODE_TYPES.COMPONENT_CONDITION);
		result.push(NODE_TYPES.CONDITION);
	}

	//PRPS_OBJECT
	if (
		node.name === 'prps' &&
		nodeHasType(parentNode, NODE_TYPES.COMPONENT)
	)
		result.push(NODE_TYPES.PRPS_OBJECT);

	//WGTS_ARRAY
	if (
		(
			(
				node.name === 'wgts' &&
				nodeHasType(parentNode, NODE_TYPES.COMPONENT)
			) ||
			(
				node.name === 'value' &&
				nodeHasType(parentNode, NODE_TYPES.SCP_ACTION) &&
				parentNode?.value &&
				(parentNode?.value as JSONObject).type === 'setState' &&
				(parentNode?.value as JSONObject).key === 'extraWgts' &&
				parentNode?.valueType === 'array'
			) ||
			(
				node.name === 'popoverMda' &&
				node.valueType === 'array' &&
				nodeHasType(parentNode, NODE_TYPES.PRPS_OBJECT)
			)
		)
	)
		result.push(NODE_TYPES.WGTS_ARRAY);

	//COMPONENT_POPOVER_MDA
	if (
		(
			(
				node.name === 'popoverMda' ||
				node.name === 'tooltipMda'
			) &&
			node.valueType === 'object'
		)
	)
		result.push(NODE_TYPES.COMPONENT_POPOVER_MDA);

	//COMPONENT_POPOVER_MDA
	if (
		(
			parentNode?.name === 'popoverMda' &&
			parentNode?.valueType === 'array'
		)
	)
		result.push(NODE_TYPES.COMPONENT_POPOVER_MDA);
};

export default setComponentType;
