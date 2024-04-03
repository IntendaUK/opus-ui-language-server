// Utils
import { ancestorHasType, nodeHasType, traitDefinitionIsUsed } from './utils';
import { getNodeParent } from '../../nodeRetrievalUtils';

//Builders
import buildBase from './builders/base';
import buildComponent from './builders/component';
import buildTD from './builders/traitOrDashboard';
import buildTrait from './builders/trait';
import buildPrp from './builders/prp';
import buildScp from './builders/scp';
import buildCondition from './builders/condition';
import buildOther from './builders/other';

// Model
import type { Node, Nodes } from '../../../model';

//Config
import { NODE_TYPES } from './config';

//Helpers
const setTypes = (node: Node, nodes: Nodes) => {
	const result = node.types;

	buildBase(node, nodes);

	if (ancestorHasType(node, nodes, NODE_TYPES.APP_PACKAGE_FILE) || ancestorHasType(node, nodes, NODE_TYPES.APP_SERVE_MDA_FILE) || ancestorHasType(node, nodes, NODE_TYPES.APP_DATA_FOLDER))
		return;

	const parentNode: null | Node = getNodeParent(node, nodes);

	buildComponent(node, nodes);
	buildTD(node, nodes);
	buildTrait(node, nodes);
	buildPrp(node, nodes);
	buildScp(node, nodes);
	buildCondition(node, nodes);
	buildOther(node, nodes);

	//TRAIT_UNUSED
	if (
		node.name.includes('.json') &&
		nodeHasType(parentNode, NODE_TYPES.FOLDER) &&
		!nodeHasType(node, NODE_TYPES.DASHBOARD) &&
		!nodeHasType(node, NODE_TYPES.TRAIT_DEFINITION) &&
		!nodeHasType(node, NODE_TYPES.ENSEMBLE_CONFIG) &&
		!nodeHasType(node, NODE_TYPES.ENSEMBLE_PACKAGE) &&
		!nodeHasType(node, NODE_TYPES.THEME) &&
		!traitDefinitionIsUsed(node)
	)
		result.push(NODE_TYPES.TRAIT_UNUSED);

	//TRAIT_UNUSED_SUB_ENTRY
	if (ancestorHasType(parentNode, nodes, NODE_TYPES.TRAIT_UNUSED))
		result.push(NODE_TYPES.TRAIT_UNUSED_SUB_ENTRY);
};

const setNodeTypes = (nodes: Nodes, node: Node) => {
	node.types = [];

	setTypes(node, nodes);

	if (node.types.length === 0) {
		console.log(`WARNING: No types found for node: ${node.path}`);

		return;
	}

	node.childPaths.forEach(childPath => {
		const childNode: Node = nodes.get(childPath)!;

		setNodeTypes(nodes, childNode);
	});
};

export default setNodeTypes;
