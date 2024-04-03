// Model
import type { JSONObject, Node, Nodes, TraitDefinitionMap } from '../../../../model';

// External
import { getNodeParent } from '../../../nodeRetrievalUtils';

// Managers
import ServerManager from '../../../../managers/serverManager';

// Utils
export const nodeHasType = (node: null | Node, checkType: symbol) => {
	if (!node)
		return false;

	return node.types?.includes(checkType);
};

export const ancestorHasType = (node: null | Node, nodes: Nodes, checkType: symbol): boolean => {
	if (!node)
		return false;
	else if (nodeHasType(node, checkType))
		return true;

	const parentNode: null | Node = getNodeParent(node, nodes);

	return ancestorHasType(parentNode, nodes, checkType);
};

export const ancestorHasComponentType = (node: null | Node, componentType: string): boolean => {
	if (!node)
		return false;
	else if (node.value === null)
		return false;
	else if ((node.value as JSONObject).type === componentType)
		return true;

	return ancestorHasComponentType(getNodeParent(node, ServerManager.caches.nodes), componentType);
};

export const keyExistsInChildren = (value: any, key: string, allowPartial = false) => {
	let found = Object.keys(value).some(k => {
		if (allowPartial && k.includes(key))
			return true;

		return k === key;
	});

	if (found)
		return true;

	found = Object.values(value).some(v => {
		if (v === null || typeof(v) !== 'object')
			return false;

		if (keyExistsInChildren(v, key, allowPartial))
			return true;

		return false;
	});

	return found;
};

export const countProperties = (value: any, propertyList: string[]) => {
	if (value === null)
		return 0;

	const result = propertyList.filter(p => Object.prototype.hasOwnProperty.call(value, p)).length;

	return result;
};

export const traitDefinitionIsUsed = (node: Node): boolean => {
	const traitDefinition: TraitDefinitionMap | null = ServerManager.caches.traitDefinitionsMap.get(node.path) || null;

	if (!traitDefinition)
		return false;

	return traitDefinition.usedBy.length > 0;
};
