// Model
import type { Node, Nodes } from '../../model';

// Helpers
import { getAllComponentNodesWithIdScopeOrRelIdMatches, getIdScopeRelIdDataFromIdValue } from '../componentIdOrScopeUtils';
import { getPropertyValueFromParentNodeValue } from '../nodeValueRetrievalUtils';
import { getClosestComponentNode } from './index';

// Local Model
export type SourceTargetKey = 'source' | 'target' | 'from' | 'to'

// Implementation
const getSourceNodeOrTargetNode = (node: Node, nodes: Nodes, key: SourceTargetKey): null | Node => {
	const sourceOrTargetComponentId = getPropertyValueFromParentNodeValue(node, nodes, key, 'string') as null | string;
	if (!sourceOrTargetComponentId) {
		const selfComponentNode = getClosestComponentNode(nodes, node);
		if (!selfComponentNode) 
			return null;

		return selfComponentNode;
	}

	const { isId, isScopedId, isRelativeId } = getIdScopeRelIdDataFromIdValue(sourceOrTargetComponentId);

	const scopeIdRelIdMatchesForAllNodes = getAllComponentNodesWithIdScopeOrRelIdMatches(nodes);

	const fromOrToNodeMatchData = scopeIdRelIdMatchesForAllNodes.find(({ matches }) => matches.find(m => {
		if (isId && m.matchedOn === 'id') 
			return m.matchedValue === sourceOrTargetComponentId;

		if (isScopedId && m.matchedOn === 'scope') 
			return `||${m.matchedValue}||` === sourceOrTargetComponentId;

		if (isRelativeId && m.matchedOn === 'relId') 
			return m.matchedValues!.find(mv => mv === sourceOrTargetComponentId);
		
	}));

	if (!fromOrToNodeMatchData) 
		return null;

	const { node: fromOrToNode } = fromOrToNodeMatchData;

	return fromOrToNode;
};

export default getSourceNodeOrTargetNode;
