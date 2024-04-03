// Plugins
// @ts-ignore
import FuzzyMatcher from 'fuzzy-matching';

import { scpEntries } from '../../../../managers/serverManager/events/onProvideSuggestions/types/scpEntries/config';

// Config
import { NODE_TYPES } from '../../../../utils/buildNodes/setNodeTypes/config';

// Utils
import { nodeHasType } from '../../../../utils/buildNodes/setNodeTypes/utils';
import { getValueTypeAsString, isArray } from '../../../../utils/utils';

// Model
import type { ValueType } from '../../../../utils/utils';
import type { Nodes, Node, NodeError, JSONValue, JSONObject, ScpEntryItemConfig } from '../../../../model';

// Managers
import ServerManager from '../../../../managers/serverManager';

// Local Internals
const errorType = 'Script';

const fmScript = new FuzzyMatcher(scpEntries.map(e => e.key));
const fmActions: Record<string, any> = {};

let INITIALIZED = false;

// Local Helpers
const init = () => {
	Array.from(ServerManager.caches.opusActionsMap.values()).forEach(a => {
		const fm = new FuzzyMatcher(a.keys.map(({ key }) => key));

		fmActions[a.key] = fm;
	});

	INITIALIZED = true;
};

const calculateIfTypeMatches = (actionEntryConfig: ScpEntryItemConfig, value: JSONValue, valueType: ValueType): boolean => {

	const supportedTypes = isArray(actionEntryConfig.type) ? actionEntryConfig.type as string[] : [actionEntryConfig.type as string];

	if (supportedTypes.includes(valueType))
		return true;

	if (
		(supportedTypes.includes('object') || supportedTypes.includes('array') || supportedTypes.includes('integer') || supportedTypes.includes('decimal'))
		&&
		valueType === 'string' && (value as string).includes('{{')
		||
		((value as string)[0] === '$' && (value as string)[(value as string).length - 1] === '$')
	) return true;

	if (
		(supportedTypes.includes('integer') || supportedTypes.includes('decimal')) &&
		valueType === 'number' &&
		~~(value as number) === value
	)
		return true;

	return false;
};

const checkScpKeywords = (node: Node, nodes: Nodes, errors: NodeError[]) => {
	node.childPaths.forEach(childPath => {
		const scpEntryNode = nodes.get(childPath);
		if (!scpEntryNode)
			return;

		if (scpEntryNode.fileLineMapping!.lineStringFlags.keyIsEmpty && nodeHasType(scpEntryNode, NODE_TYPES.BRACKET_END)) 
			return;

		const scpEntryKey = scpEntryNode.name;

		const match = fmScript.get(scpEntryKey);
		if (match.distance === 1)
			return;

		if (match.distance > 0) {
			errors.push({
				errorType,
				message: `Keyword "${scpEntryKey}" is not expected in script, did you mean "${match.value}"?`,
				erroredIn: 'KEY',
				errorSolution: match.value,
				severity: 1,
				node: scpEntryNode
			});

			return;
		}

		errors.push({
			errorType,
			message: nodeHasType(scpEntryNode, NODE_TYPES.EMPTY_KEY) ? 'Script contains an empty line break.' : `Keyword "${scpEntryKey}" not expected in script.`,
			erroredIn: 'KEY',
			errorSolution: 'UNKNOWN',
			severity: 1,
			node: scpEntryNode
		});
	});
};

const checkActionType = (actionTypeNode: Node, nodes: Nodes, actionType: string, errors: NodeError[]) => {
	if (['log'].includes(actionType)) {
		errors.push({
			errorType,
			message: `The "${actionType}" action" should only be used for debugging purposes`,
			erroredIn: 'VALUE',
			errorSolution: 'UNKNOWN',
			severity: 2,
			node: actionTypeNode
		});
	}

	const fmAction = fmActions[actionType];
	if (!fmAction) {
		errors.push({
			errorType,
			message: `The "${actionType}" action does not exist. If this is a custom external action, you can safely ignore this`,
			erroredIn: 'VALUE',
			errorSolution: 'UNKNOWN',
			severity: 2,
			node: actionTypeNode
		});

		return;
	}
};

const checkActionEntryValues = (actionNode: Node, nodes: Nodes, actionType: string, errors: NodeError[]) => {
	const actionConfig = ServerManager.caches.opusActionsMap.get(actionType);
	if (!actionConfig)
		return;

	Object.entries(actionNode.value as JSONObject).forEach(([k, v]) => {
		if (k === 'id')
			return;

		const actionEntryNode = nodes.get(`${actionNode.path}/${k[0] === '^' ? k.substring(1) : k}`);
		if (!actionEntryNode)
			return;

		const actionEntryKey = actionEntryNode.name;

		const match = fmActions[actionType].get(actionEntryKey);

		if (match.distance === 1) {
			const actionEntryConfig = actionConfig.keys.find(f => f.key === actionEntryKey);
			if (!actionEntryConfig)
				return;

			const vType = getValueTypeAsString(v);

			const typeMatches = calculateIfTypeMatches(actionEntryConfig, v, vType);
			if (!typeMatches) {
				errors.push({
					errorType,
					message: `Property "${actionEntryKey}" is of type "${vType}", expected "${actionEntryConfig.type}"`,
					erroredIn: 'VALUE',
					errorSolution: 'UNKNOWN',
					severity: 1,
					node: actionEntryNode
				});
			}

			return;
		}

		if (match.distance > 0.6) {
			errors.push({
				errorType,
				message: `Keyword "${actionEntryKey}" not expected in script action type "${actionType}", did you mean "${match.value}"?`,
				erroredIn: 'KEY',
				errorSolution: match.value,
				severity: 2,
				node: actionEntryNode
			});

			return;
		}

		errors.push({
			errorType,
			message: `Keyword "${actionEntryKey}" not expected in script action type "${actionType}"`,
			erroredIn: 'KEY',
			errorSolution: 'UNKNOWN',
			severity: 2,
			node: actionEntryNode
		});
	});
};

const checkScriptActions = (node: Node, nodes: Nodes, errors: NodeError[]) => {
	const scpActionsNode = nodes.get(`${node.path}/actions`);
	if (!scpActionsNode)
		return;

	scpActionsNode.childPaths.forEach((childPath: string) => {
		const actionNode = nodes.get(childPath);
		if (!actionNode)
			return;

		const actionTypeNode = nodes.get(`${actionNode.path}/type`);
		if (!actionTypeNode)
			return;

		const actionType: JSONValue = actionTypeNode.value;
		if (!actionType || typeof actionType !== 'string')
			return;

		checkActionType(actionTypeNode, nodes, actionType, errors);

		checkActionEntryValues(actionNode, nodes, actionType, errors);
	});
};

//Checks
const checkScript = (nodes: Nodes, node: Node, errors: NodeError[]) => {
	if (!nodeHasType(node, NODE_TYPES.SCP) || node.value === null || nodeHasType(node, NODE_TYPES.BRACKET_END))
		return;

	if (!INITIALIZED)
		init();

	checkScpKeywords(node, nodes, errors);

	checkScriptActions(node, nodes, errors);
};

export const check = checkScript;
