// Config
import ServerManager from '../../../../managers/serverManager';
import { NODE_TYPES } from '../config';

// Utils
import { nodeHasType, traitDefinitionIsUsed } from '../utils';
import { getNodeParent } from '../../../nodeRetrievalUtils';

// Model
import type { Node, Nodes } from '../../../../model';

// Implementation
const setTDTypes = (node: Node, nodes: Nodes) => {
	const result = node.types;

	const parentNode: null | Node = getNodeParent(node, nodes);
	const nodeChildren = node.childPaths.map(p => nodes.get(p)!);

	//TRAIT_DEFINITION
	if (nodeHasType(node, NODE_TYPES.FILE)) {
		if (
			node.parentPath !== ServerManager.paths.opusAppMdaPath &&
			!nodeHasType(node, NODE_TYPES.COMPONENT) &&
			!nodeHasType(node, NODE_TYPES.THEME) &&
			!nodeHasType(node, NODE_TYPES.ENSEMBLE_CONFIG) &&
			!nodeHasType(node, NODE_TYPES.ENSEMBLE_CONFIG_ENTRY) &&
			!nodeHasType(node, NODE_TYPES.ENSEMBLE_PACKAGE) &&
			!nodeHasType(node, NODE_TYPES.ENSEMBLE_PACKAGE_ENTRY) &&
			!nodeHasType(node, NODE_TYPES.STARTUP) &&
			!nodeChildren.some(c => c.name === 'traitArray')
		)
			result.push(NODE_TYPES.COMPONENT);

		if (traitDefinitionIsUsed(node))
			result.push(NODE_TYPES.TRAIT_DEFINITION);
	}

	//DASHBOARD
	if (
		node.name.indexOf('.json') > -1 &&
		nodeHasType(parentNode, NODE_TYPES.FOLDER) &&
		!nodeHasType(node, NODE_TYPES.TRAIT_DEFINITION) &&
		!nodeHasType(node, NODE_TYPES.ENSEMBLE_CONFIG) &&
		!nodeHasType(node, NODE_TYPES.ENSEMBLE_PACKAGE) &&
		!nodeChildren.some(c => c.name === 'acceptPrps')
	)
		result.push(NODE_TYPES.DASHBOARD);
};

export default setTDTypes;
