// Plugins
// @ts-ignore
import FuzzyMatcher from 'fuzzy-matching';

// Config
import { NODE_TYPES } from '../../../../utils/buildNodes/setNodeTypes/config';

// Utils
import { nodeHasType } from '../../../../utils/buildNodes/setNodeTypes/utils';

// Model
import type { Nodes, Node, NodeError } from '../../../../model';

//Internals
const errorType = 'Flows';

//Checks
const flows = (nodes: Nodes, node: Node, errors: NodeError[]) => {
	if (!nodeHasType(node, NODE_TYPES.FLOW) || nodeHasType(node, NODE_TYPES.BRACKET_END))
		return;

	if (node.value === null)
		return;

	//Flows need certain keywords
	const fm = new FuzzyMatcher(['from', 'to', 'fromKey', 'toKey', 'toSubKey', 'fromSubKey', 'mapFunctionString', 'ignoreEmptyString']);

	Object.entries(node.value).forEach(([k]) => {
		const match = fm.get(k);
		if (match.distance === 1)
			return;

		if (match.distance > 0) {
			errors.push({
				errorType,
				message: `Incorrect keyword found "${k}", did you mean "${match.value}"?`,
				erroredIn: 'KEY',
				errorSolution: match.value,
				severity: 2,
				node
			});
		} else {
			errors.push({
				errorType,
				message: `Incorrect keyword found "${k}"`,
				erroredIn: 'KEY',
				errorSolution: match.value,
				severity: 2,
				node
			});
		}
	});
};

export const check = flows;
