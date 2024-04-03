// Utils
import { getNodeParent } from './nodeRetrievalUtils';
import { nodeHasType } from './buildNodes/setNodeTypes/utils';
import { getIdFromComponentNodeValue, getRelIdFromComponentNodeValue, getScopeFromComponentNodeValue } from './nodeValueRetrievalUtils';

// Model
import type { Node, Nodes } from '../model';

// Config
import { NODE_TYPES } from './buildNodes/setNodeTypes/config';

// Local Model
export type IdScopeRelIdMatch = { node: Node, matches: { matchedOn: 'id' | 'scope' | 'relId', matchedValue: string, matchedValues?: string[] }[] }

export type ScopeIdRelIdData = {
	isScopedOrRelativeId: boolean,
	isScopedId: boolean,
	isRelativeId: boolean,
	isId: boolean
}

// Internal Utils
export const getIdScopeRelIdDataFromIdValue = (scopeOrIdValue: string): ScopeIdRelIdData => {
	const isScopedOrRelativeId = /^(\|\|).*\1$/.test(scopeOrIdValue);
	const isScopedId = isScopedOrRelativeId && !scopeOrIdValue.includes('.');
	const isRelativeId = isScopedOrRelativeId && scopeOrIdValue.includes('.');
	const isId = !isScopedOrRelativeId;

	return {
		isScopedOrRelativeId,
		isScopedId,
		isRelativeId,
		isId
	};
};

const buildScopesForRelativeId = (node: Node, nodes: Nodes, relId: string, scopes: string[]) => {
	const scope: null | string = getScopeFromComponentNodeValue(node);
	if (scope) 
		scopes.push(`||${scope}.${relId}||`);

	if (node.calledByComponentsPaths.length) {
		node.calledByComponentsPaths.forEach(np => {
			const n = nodes.get(np)!;

			buildScopesForRelativeId(n, nodes, relId, scopes);
		});
	}

	const parentNode = getNodeParent(node, nodes);

	if (!parentNode || !nodeHasType(parentNode, NODE_TYPES.WGTS_ARRAY))
		return;

	const nodeParentComponentNode = getNodeParent(parentNode, nodes);

	if (nodeParentComponentNode)
		buildScopesForRelativeId(nodeParentComponentNode, nodes, relId, scopes);
};

export const findIdScopeRelIdMatchesForNode = (node: Node, nodes: Nodes): IdScopeRelIdMatch => {
	const matches = [];

	const id: null | string = getIdFromComponentNodeValue(node);
	if (id)
		matches.push({ matchedOn: 'id', matchedValue: id });

	const scope: null | string = getScopeFromComponentNodeValue(node);
	if (scope)
		matches.push({ matchedOn: 'scope', matchedValue: scope });

	const relId: null | string = getRelIdFromComponentNodeValue(node);
	if (relId) {
		const scopesForRelativeId: string[] = [];

		buildScopesForRelativeId(node, nodes, relId, scopesForRelativeId);

		matches.push({ matchedOn: 'relId', matchedValue: relId, matchedValues: scopesForRelativeId });
	}

	return { node, matches } as IdScopeRelIdMatch;
};

export const getAllComponentNodesWithIdScopeOrRelIdMatches = (nodes: Nodes): IdScopeRelIdMatch[] => {
	const componentNodesWithIdScopeOrRelId: IdScopeRelIdMatch[] = [];

	Array.from(nodes.values())
		.forEach(node => {
			const matchData = findIdScopeRelIdMatchesForNode(node, nodes);
			if (!matchData.matches.length)
				return;

			return componentNodesWithIdScopeOrRelId.push(matchData);
		});

	return componentNodesWithIdScopeOrRelId;
};

export const getAllNodesThatMatchIdValue = (idValue: unknown, nodes: Nodes): Node[] => {
	if (typeof idValue !== 'string')
		return [];

	const allNodesWithIdScopeOrRelIdMatches = getAllComponentNodesWithIdScopeOrRelIdMatches(nodes);

	const { isId, isScopedId, isRelativeId } = getIdScopeRelIdDataFromIdValue(idValue);

	const matches = allNodesWithIdScopeOrRelIdMatches
		.filter(m => {
			if (isId)
				return !!m.matches.find(n => n.matchedOn === 'id' && n.matchedValue === idValue);

			if (isScopedId)
				return !!m.matches.find(n => n.matchedOn === 'scope' && `||${n.matchedValue}||` === idValue);

			if (isRelativeId)
				return !!m.matches.find(n => n.matchedOn === 'relId' && n.matchedValues!.find(mv => mv === idValue));
		}).map(m => m.node);

	return matches;
};
