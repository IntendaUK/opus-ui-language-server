// Model
import type { Node, Nodes } from '../../model';

// Config
import { NODE_TYPES } from '../buildNodes/setNodeTypes/config';

// Helpers
import { nodeHasType } from '../buildNodes/setNodeTypes/utils';
import { getTraitDefinitionPathFromTraitDefinitionPathDelta } from '../pathUtils';

// Managers
import ServerManager from '../../managers/serverManager';

// Local Helpers
export const getRootComponentNodes = (nodesMap: Nodes, node: Node, rootComponentNodes: Node[] = []) => {
	if (!nodeHasType(node, NODE_TYPES.TRAIT_DEFINITION) || !node.calledByComponentsPaths.length) {
		rootComponentNodes.push(node);
		return rootComponentNodes;
	}

	node.calledByComponentsPaths.forEach(callerComponentPath => {
		const callerComponentNode = nodesMap.get(callerComponentPath)!;

		getRootComponentNodes(nodesMap, callerComponentNode, rootComponentNodes);
	});

	return rootComponentNodes;
};

export const getClosestComponentNode = (nodesMap: Nodes, node: Node): null | Node => {
	try {
		if (nodeHasType(node, NODE_TYPES.COMPONENT)) return node;

		return getClosestComponentNode(nodesMap, nodesMap.get(node.parentPath!)!);
	} catch {
		return null;
	}
};

export const getPrpsNodeFromComponentNode = (componentNode: Node, nodes: Nodes): null | Node => {
	if (!componentNode.value || componentNode.valueType !== 'object') 
		return null;

	const componentPrpsNode: undefined | Node = nodes.get(`${componentNode.path}/prps`);

	if (!componentPrpsNode || componentPrpsNode.valueType !== 'object') 
		return null;

	return componentPrpsNode;
};

export const getNodeParent = (node: Node, nodes: Nodes): null | Node => {
	if (node.parentPath === null || node.parentPath === ServerManager.paths.opusAppPath)
		return null;

	const parentNode: undefined | Node = nodes.get(node.parentPath);

	if (!parentNode) {
		console.log(`WARNING: Couldn't find parent node for: ${node.path}`);

		return null;
	}

	return parentNode;
};

export const getTraitDefinitionNodeFromTraitDefinitionPathDelta = (traitDefinitionPathDelta: string, filePathThatDeclaresTrait: string): null | Node => {
	const nodePath = getTraitDefinitionPathFromTraitDefinitionPathDelta(traitDefinitionPathDelta, filePathThatDeclaresTrait);

	const traitDefinitionNode: null | Node = ServerManager.caches.nodes.get(nodePath) || null;

	return traitDefinitionNode;
};
