// Plugins
// @ts-ignore
import FuzzyMatcher from 'fuzzy-matching';

// Config
import { NODE_TYPES } from '../../../../utils/buildNodes/setNodeTypes/config';

// Utils
import { nodeHasType } from '../../../../utils/buildNodes/setNodeTypes/utils';
import { matchTraitDefinitionEnsemblePathToEnsemblePath } from '../../../../utils/pathUtils';

// Model
import type { Nodes, Node, NodeError } from '../../../../model';

// Managers
import ServerManager from '../../../../managers/serverManager';

//Internals
const errorType = 'Startup';

const fm = new FuzzyMatcher(['startup', 'themes', 'themeSets']);

//Checks
const startup = (nodes: Nodes, node: Node, errors: NodeError[]) => {
	if (!nodeHasType(node, NODE_TYPES.STARTUP))
		return;

	if (node.value === null)
		return;

	node.childPaths.forEach(childPath => {
		const startupEntryNode = nodes.get(childPath);
		if (!startupEntryNode)
			return;

		if (startupEntryNode.fileLineMapping!.lineStringFlags.keyIsEmpty && nodeHasType(startupEntryNode, NODE_TYPES.BRACKET_END))
			return;

		const startupEntryKey = startupEntryNode.name;

		const match = fm.get(startupEntryKey);

		if (match.distance === 1) {

			if (startupEntryKey === 'startup' && startupEntryNode.valueType === 'string') {
				const startupEntryValue = (startupEntryNode.value as string);

				if (startupEntryValue.charAt(0) === '@') {
					const { matched, ensembleName } = matchTraitDefinitionEnsemblePathToEnsemblePath(ServerManager.paths.opusEnsemblePaths, startupEntryValue);

					if (!matched) {
						errors.push({
							errorType,
							message: `Ensemble "${ensembleName}" could not be determined. Ensure it is added to both opusUiEnsembles and the dependencies object inside package.json, and is installed using "npm install"`,
							erroredIn: 'VALUE',
							errorSolution: match.value,
							severity: 1,
							node: startupEntryNode
						});
					}

				}
			}

			return;
		}

		if (match.distance > 0) {
			errors.push({
				errorType,
				message: `Incorrect keyword found "${startupEntryKey}", did you mean "${match.value}"?`,
				erroredIn: 'KEY',
				errorSolution: match.value,
				severity: 2,
				node: startupEntryNode
			});
		} else {
			errors.push({
				errorType,
				message: `Incorrect keyword found "${startupEntryKey}"`,
				erroredIn: 'KEY',
				errorSolution: match.value,
				severity: 1,
				node: startupEntryNode
			});
		}
	});

};

export const check = startup;
