// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { SourceTargetKey } from '../../../../../../../utils/nodeRetrievalUtils/getSourceNodeOrTargetNode';
import type { JSONObject, Node, Nodes } from '../../../../../../../model';
import type { PropSpecEntry } from '../utils/buildSourceOrTargetNodePropSpecEntries';

// Utils
import { getPropertyValueFromParentNodeValue } from '../../../../../../../utils/nodeValueRetrievalUtils';
import buildSourceOrTargetNodePropSpecEntries from '../utils/buildSourceOrTargetNodePropSpecEntries';
import getSourceNodeOrTargetNode from '../../../../../../../utils/nodeRetrievalUtils/getSourceNodeOrTargetNode';
import buildCompletionItem from '../../buildCompletionItem';

// Local Model
type KeyFromTo = null | 'fromKey' | 'toKey'

// Local Helpers
const buildSuggestionsForFromKeyOrToKey = (node: Node, nodes: Nodes, prpEntries: PropSpecEntry[]): CompletionItem[] => {
	const completionItems = prpEntries.map(prpEntry => {
		const { key, desc, value, type } = prpEntry;
		return buildCompletionItem(
			node,
			'VALUE',
			key,
			type as string,
			value + '',
			'string',
			desc,
			nodes
		);
	});

	return completionItems;
};

const buildSuggestionsForFromSubKeyOrToSubKey = (node: Node, nodes: Nodes, keyFromTo: KeyFromTo, prpEntries: PropSpecEntry[]): null |CompletionItem[] => {
	const flowFromKeyOrToKeyValue = getPropertyValueFromParentNodeValue(node, nodes, keyFromTo!, 'string');
	if (!flowFromKeyOrToKeyValue)
		return null;

	const prpEntry = prpEntries.find(p => p.key === flowFromKeyOrToKeyValue);
	if (!prpEntry || prpEntry.type !== 'object')
		return null;

	const completionItems = Object.entries(prpEntry.value as JSONObject).map(([key, value]) => buildCompletionItem(
		node,
		'VALUE',
		key,
		typeof value,
		value + '',
		'string',
		'This is a custom sub property.',
		nodes
	));

	return completionItems;
};

// Implementation
const buildCpnPrpKeyFromKeyOrToKeySuggestions = async (node: Node, nodes: Nodes, key: SourceTargetKey, keyFromTo: KeyFromTo = null): Promise<null | CompletionItem[]> => {
	const sourceOrTargetNode = getSourceNodeOrTargetNode(node, nodes, key);
	if (!sourceOrTargetNode)
		return null;

	const sourceOrTargetNodePropSpecEntries: PropSpecEntry[] = await buildSourceOrTargetNodePropSpecEntries(sourceOrTargetNode, nodes);

	if (!keyFromTo)
		return buildSuggestionsForFromKeyOrToKey(node, nodes, sourceOrTargetNodePropSpecEntries);

	return buildSuggestionsForFromSubKeyOrToSubKey(node, nodes, keyFromTo, sourceOrTargetNodePropSpecEntries);
};

export default buildCpnPrpKeyFromKeyOrToKeySuggestions;
