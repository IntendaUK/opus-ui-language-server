// Helpers
import { getPropertyValueFromParentNodeValue } from '../../../../../../../utils/nodeValueRetrievalUtils';

// Managers
import ServerManager from '../../../../../index';

// Model
import type { Node, Nodes, ScpEntryConfig } from '../../../../../../../model';

// Local Internals
const fnMapper = {
	opusTriggersMap: 'event',
	opusActionsMap: 'type',
	opusOperatorsMap: 'operator'
};

// Implementation
const getScpEntryConfig = (node: Node, nodes: Nodes, mapKey: 'opusTriggersMap' | 'opusActionsMap' | 'opusOperatorsMap'): null | ScpEntryConfig => {
	const fnGetKey = fnMapper[mapKey] || null;
	if (!fnGetKey)
		return null;

	const key = getPropertyValueFromParentNodeValue(node, nodes, fnGetKey, 'string');
	if (!key)
		return null;

	const config = ServerManager.caches[mapKey].get(key as string);
	if (!config)
		return null;

	return config;
};

export default getScpEntryConfig;
