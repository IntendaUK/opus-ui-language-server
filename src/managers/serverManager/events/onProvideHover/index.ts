// Model
import type { Hover, HoverParams } from 'vscode-languageserver';
import type { Nodes } from '../../../../model';
import type { NodeMatchData } from '../../../../utils/findNodeMatchDataFromFilePosition';

// Internals
import { NODE_TYPES } from '../../../../utils/buildNodes/setNodeTypes/config';

// Helpers
import { nodeHasType } from '../../../../utils/buildNodes/setNodeTypes/utils';
import { getNodeParent } from '../../../../utils/nodeRetrievalUtils';
import fileIsOutsideScope from '../../../../utils/fileIsOutsideScope';
import findNodeMatchDataFromFilePosition from '../../../../utils/findNodeMatchDataFromFilePosition';
import buildComponentPrpHover from './types/componentPrpEntries';
import buildScpActionEntriesHover from './types/scpActionEntries';
import buildScpTriggerEntriesHover from './types/scpTriggerEntries';

// Managers
import ServerManager from '../../index';

// Internal Helpers
const build = async (nodes: Nodes, nodeMatchData: NodeMatchData): Promise<null | string> => {
	const { node } = nodeMatchData;

	// PRP
	if (nodeHasType(node, NODE_TYPES.PRP))
		return await buildComponentPrpHover(nodeMatchData, nodes);

	// SCP TRIGGER ENTRY
	if (nodeHasType(getNodeParent(node, nodes), NODE_TYPES.SCP_TRIGGER))
		return await buildScpTriggerEntriesHover(nodeMatchData, nodes);

	// SCP ACTION ENTRY
	if (nodeHasType(node, NODE_TYPES.SCP_ACTION_ENTRY)) 
		return await buildScpActionEntriesHover(nodeMatchData, nodes);

	return null;
};

// Implementation
const onProvideHover = async ({ textDocument: { uri: fileUri }, position }: HoverParams): Promise<null | Hover> => {
	try {
		const nodes = ServerManager.caches.nodes;

		if (fileIsOutsideScope(fileUri))
			return null;

		const nodeMatchData = findNodeMatchDataFromFilePosition(fileUri, nodes, position);
		if (!nodeMatchData)
			return null;

		const hoverString = await build(nodes, nodeMatchData);
		if (!hoverString)
			return null;

		const hover: Hover = {
			contents: {
				kind: 'markdown',
				value: hoverString
			},
			range: {
				start: position,
				end: position
			}
		};

		return hover;
	} catch (e) {
		return null;
	}
};

export default onProvideHover;
