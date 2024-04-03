// Model
import type { JSONObject, JSONValue, Node, Nodes, TraitAuth, TraitCondition, TraitPath, TraitPrps } from '../../model';

// Config
import { NODE_TYPES } from '../buildNodes/setNodeTypes/config';

// Helpers
import { nodeHasType } from '../buildNodes/setNodeTypes/utils';
import { getNodeParent } from '../nodeRetrievalUtils';
import { isArray, isObjectLiteral, type ValueType } from '../utils';

// Managers
import ServerManager from '../../managers/serverManager';

// Local Utils

// Component Nodes
export const getIdFromComponentNodeValue = (node: Node): null | string => {
	if (!nodeHasType(node, NODE_TYPES.COMPONENT))
		return null;

	if (!node.value)
		return null;

	if (!isObjectLiteral(node.value))
		return null;

	const nodeValue = node.value as JSONObject;

	if (!nodeValue.id)
		return null;

	return nodeValue.id as string;
};

export const getScopeFromComponentNodeValue = (node: Node): null | string => {
	if (!nodeHasType(node, NODE_TYPES.COMPONENT))
		return null;

	if (!node.value)
		return null;

	if (!isObjectLiteral(node.value))
		return null;

	const nodeValue = node.value as JSONObject;

	if (!nodeValue.scope)
		return null;

	return nodeValue.scope as string;
};

export const getRelIdFromComponentNodeValue = (node: Node): null | string => {
	if (!nodeHasType(node, NODE_TYPES.COMPONENT))
		return null;

	if (!node.value)
		return null;

	if (!isObjectLiteral(node.value))
		return null;

	const nodeValue = node.value as JSONObject;

	if (!nodeValue.relId)
		return null;

	return nodeValue.relId as string;
};

export const getTypeFromComponentNodeValue = (node: Node): null | string => {
	const value: JSONValue = node.value;
	if (!value || !isObjectLiteral(value)) 
		return null;

	const componentType: JSONValue = (value as JSONObject).type;
	if (!componentType || typeof componentType !== 'string') 
		return null;

	return componentType;
};

// Misc
export const getPropertyValueFromParentNodeValue = (fromKeyNode: Node, nodes: Nodes, key: string, checkType: ValueType): null | JSONValue => {
	const nodeParent = getNodeParent(fromKeyNode, nodes);
	if (!nodeParent)
		return null;

	let nodeParentValue: JSONValue = nodeParent.value;
	if (!nodeParentValue || !isObjectLiteral(nodeParentValue))
		return null;

	nodeParentValue = nodeParentValue as JSONObject;

	if (nodeParentValue[key] === undefined)
		return null;

	if (checkType === 'object' && !isObjectLiteral(nodeParentValue[key])) 
		return null;

	if (checkType === 'array' && !isArray(nodeParentValue[key])) 
		return null;

	if (checkType === 'null' && nodeParentValue[key] !== null) 
		return null;

	if (typeof nodeParentValue[key] !== checkType)
		return null;

	return nodeParentValue[key];
};

export const getNodeNameValue = (path: string): string => {
	let name = path.slice(path.lastIndexOf('/') + 1);

	if (name[0] === '^')
		name = name.slice(1);

	return name;
};

export const getStartupDashboardFromNodeValue = (nodes: Nodes): null | string => {
	const startupDashboardNode = nodes.get(`${ServerManager.paths.opusAppMdaPath}/dashboard/index.json/startup`);
	if (!startupDashboardNode)
		return null;

	const startupDashboardValue: JSONValue = startupDashboardNode.value;
	if (!startupDashboardValue || typeof startupDashboardValue !== 'string')
		return null;

	return startupDashboardValue;
};

// Traits
export type TraitData = null | {
	condition: null | TraitCondition
	auth: null | TraitAuth
	trait: TraitPath;
	traitPrps: null | TraitPrps;
	traitType: 'string' | 'object'
};

export const getTraitDataFromTraitValue = (traitValue: unknown): TraitData => {
	if (traitValue === null || traitValue === undefined) 
		return null;

	if (typeof traitValue === 'string') {
		return {
			condition: null,
			auth: null,
			trait: traitValue as TraitPath,
			traitPrps: null,
			traitType: 'string'
		};
	} else if (typeof traitValue === 'object') {
		const traitObject = traitValue as JSONObject;

		if (typeof traitObject.trait !== 'string') 
			return null;

		return {
			condition: traitObject.condition as TraitCondition || null,
			auth: traitObject.auth as TraitAuth || null,
			trait: traitObject.trait as TraitPath,
			traitPrps: traitObject.traitPrps as TraitPrps,
			traitType: 'object'
		};
	}

	return null;
};
