// Plugins
// @ts-ignore
import FuzzyMatcher from 'fuzzy-matching';

// Config
import { NODE_TYPES } from '../../../../utils/buildNodes/setNodeTypes/config';

// Utils
import { getNodeParent } from '../../../../utils/nodeRetrievalUtils';
import { nodeHasType } from '../../../../utils/buildNodes/setNodeTypes/utils';

// Model
import type { Nodes, Node, NodeError } from '../../../../model';

//Internals
const errorType = 'Untyped';

//Checks
const fmComponent = new FuzzyMatcher(['id', 'type', 'prps', 'wgts', 'scope', 'relId', 'traits', 'trait', 'traitPrps', 'acceptPrps', 'container', 'auth']);

const checkComponentKeywords = (node: Node, errors: NodeError[]) => {
	const match = fmComponent.get(node.name);

	if (match.distance === 1)
		return false;

	if (match.distance > 0) {
		errors.push({
			errorType,
			message: `Component contains unexpected entry "${node.name}", did you mean "${match.value}"?`,
			erroredIn: 'KEY',
			errorSolution: match.value,
			severity: 2,
			node
		});
	} else {
		errors.push({
			errorType,
			message: `Component contains unexpected entry "${node.name}"`,
			erroredIn: 'KEY',
			// @ts-ignore
			errorSolution: '',
			severity: 2,
			node
		});
	}

	return true;
};

const untyped = (nodes: Nodes, node: Node, errors: NodeError[]) => {
	if (!node.types || node.types.length > 0)
		return;

	//If we are inside a component check keywords
	if (nodeHasType(getNodeParent(node, nodes), NODE_TYPES.COMPONENT)) {
		if (checkComponentKeywords(node, errors))
			return;
	}

	errors.push({
		errorType,
		message: `Could not determine node type for "${node.name}"`,
		erroredIn: 'KEY',
		errorSolution: 'UNKNOWN',
		severity: 2,
		node
	});
};

export const check = untyped;
