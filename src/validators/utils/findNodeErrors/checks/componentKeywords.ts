// Plugins
// @ts-ignore
import FuzzyMatcher from 'fuzzy-matching';

// Config
import { NODE_TYPES } from '../../../../utils/buildNodes/setNodeTypes/config';

// Helpers
import { getNodeParent } from '../../../../utils/nodeRetrievalUtils';
import { ancestorHasComponentType, nodeHasType } from '../../../../utils/buildNodes/setNodeTypes/utils';
import { getStartupDashboardFromNodeValue } from '../../../../utils/nodeValueRetrievalUtils';
import { matchTraitDefinitionEnsemblePathToEnsemblePath } from '../../../../utils/pathUtils';

// Model
import type { Nodes, Node, NodeError } from '../../../../model';

// Managers
import ServerManager from '../../../../managers/serverManager';

//Internals
const fmComponent = new FuzzyMatcher(['id', 'type', 'prps', 'wgts', 'scope', 'relId', 'traits', 'trait', 'traitPrps', 'container', 'auth', 'comment', 'condition', 'comments']);
const fmTrait = new FuzzyMatcher(['acceptPrps', 'traitConfig', 'id', 'type', 'prps', 'wgts', 'scope', 'relId', 'traits', 'trait', 'traitPrps', 'container', 'auth', 'comment', 'condition', 'comments']);
const fmComponentInsideRowMda = new FuzzyMatcher(['rowPrps', 'id', 'type', 'prps', 'wgts', 'scope', 'relId', 'traits', 'trait', 'traitPrps', 'container', 'auth', 'comment', 'condition', 'comments']);
const fmComponentPopoverMda = new FuzzyMatcher(['position', 'popoverZIndex', 'id', 'type', 'prps', 'wgts', 'scope', 'relId', 'traits', 'trait', 'traitPrps', 'container', 'auth', 'comment', 'condition', 'comments']);

const errorType = 'Component Keywords';

//Checks
const componentKeywords = (nodes: Nodes, node: Node, errors: NodeError[]) => {
	if (!nodeHasType(node, NODE_TYPES.COMPONENT))
		return;

	const childNodes: Node[] = node.childPaths.map(childPath => nodes.get(childPath)!);

	if (nodeHasType(node, NODE_TYPES.FILE) && childNodes.length && !childNodes.find(n => n.name === 'acceptPrps')) {
		const startupDashboardValue = getStartupDashboardFromNodeValue(nodes);

		if (startupDashboardValue) {
			let startupDashboardPath;
			if (startupDashboardValue.charAt(0) === '@') {
				const { ensembleName, ensemblePath } = matchTraitDefinitionEnsemblePathToEnsemblePath(ServerManager.paths.opusEnsemblePaths, startupDashboardValue);
				startupDashboardPath = `${ensemblePath}${startupDashboardValue.slice(ensembleName.length + 1)}.json`;
			} else
				startupDashboardPath = `${ServerManager.paths.opusAppMdaPath}/dashboard/${startupDashboardValue}.json`;

			if (node.path !== startupDashboardPath) {
				errors.push({
					errorType,
					message: 'Missing acceptPrps',
					erroredIn: 'KEY',
					errorSolution: 'UNKNOWN',
					severity: 1,
					node: node
				});
			}
		}
	}

	childNodes.forEach(childNode => {
		const componentKey: string = childNode.name;

		let match;

		if (nodeHasType(node, NODE_TYPES.TRAIT_DEFINITION) || nodeHasType(node, NODE_TYPES.TRAIT_UNUSED))
			match = fmTrait.get(componentKey);
		else if (ancestorHasComponentType(getNodeParent(node, nodes), 'repeater'))
			match = fmComponentInsideRowMda.get(componentKey);
		else if (nodeHasType(node, NODE_TYPES.COMPONENT_POPOVER_MDA))
			match = fmComponentPopoverMda.get(componentKey);
		else
			match = fmComponent.get(componentKey);

		if (match.distance === 1)
			return;

		const { keyIsFalsy, valueIsObjectOpen, valueIsArrayOpen } = childNode.fileLineMapping!.lineStringFlags;

		if (match.distance > 0 && !keyIsFalsy) {
			errors.push({
				errorType,
				message: `Component keyword "${componentKey}" does not exist, did you mean "${match.value}"?`,
				erroredIn: 'KEY',
				errorSolution: match.value,
				severity: 2,
				node: childNode
			});

			return;
		}

		if (!nodeHasType(childNode, NODE_TYPES.BRACKET_END) && childNode.fileLineMapping!.lineFileStrings.length - 1 !== childNode.fileLineMapping!.lineIndex) {
			const message = (!valueIsObjectOpen && !valueIsArrayOpen && keyIsFalsy) ? 'This component has an empty line break.' : `Component keyword "${componentKey}" does not exist`;

			errors.push({
				errorType,
				message,
				erroredIn: 'KEY',
				errorSolution: 'UNKNOWN',
				severity: 2,
				node: childNode
			});
		}
	});
};

export const check = componentKeywords;
