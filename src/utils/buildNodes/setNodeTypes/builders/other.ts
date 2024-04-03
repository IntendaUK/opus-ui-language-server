// Config
import { NODE_TYPES } from '../config';

// Utils
import { getNodeParent } from '../../../nodeRetrievalUtils';
import { ancestorHasType } from '../utils';

// Model
import type { Node, Nodes } from '../../../../model';

//Helper
const setPrpTypes = (node: Node, nodes: Nodes) => {
	const result = node.types;

	const parentNode: null | Node = getNodeParent(node, nodes);

	//COMMENTS
	if (node.name === 'comments')
		result.push(NODE_TYPES.COMMENTS);

	//COMMENT
	if (
		node.name === 'comment' ||
		ancestorHasType(parentNode, nodes, NODE_TYPES.COMMENTS)
	)
		result.push(NODE_TYPES.COMMENT);
};

export default setPrpTypes;
