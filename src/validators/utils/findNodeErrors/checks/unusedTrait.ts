// Config
import { NODE_TYPES } from '../../../../utils/buildNodes/setNodeTypes/config';

// Utils
import { nodeHasType } from '../../../../utils/buildNodes/setNodeTypes/utils';

// Model
import type { Nodes, Node, NodeError } from '../../../../model';

//Internals
const errorType = 'Trait Definitions';

//Checks
const unusedTrait = (nodes: Nodes, node: Node, errors: NodeError[]) => {
	if (!nodeHasType(node, NODE_TYPES.TRAIT_UNUSED))
		return;

	errors.push({
		errorType,
		message: 'Unused trait definition. If this is called dynamically, you can ignore this',
		erroredIn: 'VALUE',
		errorSolution: 'UNKNOWN',
		severity: 3,
		node,
		displayOnFirstLine: true
	});
};

export const check = unusedTrait;
