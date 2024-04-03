// Helpers
import { getClosestComponentNode, getRootComponentNodes } from '../nodeRetrievalUtils';
import { getTypeFromComponentNodeValue } from '../nodeValueRetrievalUtils';

// Model
import type { Node, Nodes } from '../../model';

// Implementation
const findNodeComponentType = (nodesMap: Nodes, node: Node): string[] => {
	const closestComponentNode: null | Node = getClosestComponentNode(nodesMap, node);
	if (!closestComponentNode)
		return [];

	const rootComponentNodes = getRootComponentNodes(nodesMap, closestComponentNode);

	const componentTypes = Array
		.from(new Set(rootComponentNodes.flatMap(n => n.componentNodeTypes)))
		.filter(t => !!t) as string[];

	if (!componentTypes.length) {
		const nodeType: null | string = getTypeFromComponentNodeValue(closestComponentNode);

		if (nodeType)
			componentTypes.push(nodeType);
	}

	if (!componentTypes.length) {
		console.log(`Warning: ${node.path} does not have a type.`);

		return [];
	}

	return componentTypes;
};

export default findNodeComponentType;
