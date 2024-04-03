// Model
import type { Node, Nodes } from '../../model';

// Config
import { NODE_TYPES } from '../buildNodes/setNodeTypes/config';

// Utils
import { getPrpsNodeFromComponentNode } from './index';
import { nodeHasType } from '../buildNodes/setNodeTypes/utils';

// Implementation
const buildAllNestedPrpNodesForComponentNode = (componentNode: Node, nodes: Nodes, allPrpNodesForComponent: Record<string, Node> = {}): Record<string, Node> => {
	if (!nodeHasType(componentNode, NODE_TYPES.COMPONENT)) 
		return {};

	let updatedPrpNodes = { ...allPrpNodesForComponent };

	const componentPrpsNode = getPrpsNodeFromComponentNode(componentNode, nodes);

	if (componentPrpsNode) {
		updatedPrpNodes = componentPrpsNode.childPaths
			.map(p => nodes.get(p)!)
			.filter(n => n.value !== ']' && n.value !== '}' && !nodeHasType(n, NODE_TYPES.EMPTY_KEY))
			.reduce((obj, n) => ({ ...obj, [n.name]: n }), updatedPrpNodes);
	}

	if (componentNode.callsTraitDefinitionPaths.length) {
		componentNode.callsTraitDefinitionPaths.forEach(calleeTraitDefinitionPath => {
			const calleeTraitDefinitionNode = nodes.get(calleeTraitDefinitionPath);
			if (!calleeTraitDefinitionNode)
				return;

			updatedPrpNodes = {
				...updatedPrpNodes,
				...buildAllNestedPrpNodesForComponentNode(calleeTraitDefinitionNode, nodes, updatedPrpNodes)
			};
		});
	}

	return updatedPrpNodes;
};

const getAllPrpNodesForComponentNodeAndCallees = (componentNode: Node, nodes: Nodes): Node[] => {
	const res = Object.values(buildAllNestedPrpNodesForComponentNode(componentNode, nodes));

	return res;
};

export default getAllPrpNodesForComponentNodeAndCallees;
