// Plugins
// @ts-ignore
import FuzzyMatcher from 'fuzzy-matching';

// Utils
import { nodeHasType } from '../../../../utils/buildNodes/setNodeTypes/utils';
import findNodeComponentType from '../../../../utils/findTypes/findNodeComponentType';
import getComponentNodePropSpecs from '../../../../utils/propSpecs/getComponentNodePropSpecs';

// Config
import { NODE_TYPES } from '../../../../utils/buildNodes/setNodeTypes/config';

// Model
import type { Nodes, Node, NodeError } from '../../../../model';

//Internals
const errorType = 'Component Property';

//Implementation
const componentProperties = async (nodes: Nodes, node: Node, errors: NodeError[]) => {
	if (node.value === null || !nodeHasType(node, NODE_TYPES.PRPS_OBJECT))
		return;

	const componentPropSpecs = await getComponentNodePropSpecs(node, nodes);
	if (!componentPropSpecs)
		return;

	const nodePrpNodes = node.childPaths
		.map(childPath => nodes.get(childPath)!)
		.filter(n => !nodeHasType(n, NODE_TYPES.BRACKET_END));

	const fm = new FuzzyMatcher(Array.from(componentPropSpecs.keys()));

	nodePrpNodes.forEach(prpNode => {
		if (prpNode.fileLineMapping!.lineStringFlags.keyIsFalsy) {
			errors.push({
				errorType,
				message: 'Component Properties contains an empty line break.',
				erroredIn: 'KEY',
				errorSolution: 'UNKNOWN',
				severity: 3,
				node: prpNode
			});

			return;
		}

		const match = fm.get(prpNode.name);

		if (match.distance === 1) {
			const { internal } = componentPropSpecs.get(prpNode.name)!;

			if (internal) {
				errors.push({
					errorType,
					message: `Property "${prpNode.name}" is internal and should not be used.`,
					erroredIn: 'KEY',
					errorSolution: match.value,
					severity: 1,
					node: prpNode
				});
			}

			return;
		}

		if (match.distance > 0.75) {
			errors.push({
				errorType,
				message: `Unexpected property found "${prpNode.name}", did you mean "${match.value}"?`,
				erroredIn: 'KEY',
				errorSolution: match.value,
				severity: 2,
				node: prpNode
			});

			return;
		}

		errors.push({
			errorType,
			message: `Property "${prpNode.name}" is not a supported property for "${findNodeComponentType(nodes, node)[0]}". If this is a custom property, you can safely ignore this.`,
			erroredIn: 'KEY',
			errorSolution: 'UNKNOWN',
			severity: 3,
			node: prpNode
		});

	});
};

export const check = componentProperties;

