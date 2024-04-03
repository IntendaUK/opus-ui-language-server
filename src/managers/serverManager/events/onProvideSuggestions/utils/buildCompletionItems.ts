// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { Nodes } from '../../../../../model';
import type { NodeMatchData } from '../../../../../utils/findNodeMatchDataFromFilePosition';

// Config
import { NODE_TYPES } from '../../../../../utils/buildNodes/setNodeTypes/config';

// Utils
import { isArray } from '../../../../../utils/utils';
import { ancestorHasType, nodeHasType } from '../../../../../utils/buildNodes/setNodeTypes/utils';
import { getNodeParent } from '../../../../../utils/nodeRetrievalUtils';

// Builders
import buildComponentSuggestion from '../types/component';
import buildComponentEntrySuggestions from '../types/componentEntries';
import buildFlowSuggestion from '../types/flow';
import buildComponentTraitSuggestion from '../types/trait';
import buildTraitEntrySuggestion from '../types/traitEntry';
import buildTraitPrpSuggestion from '../types/traitPrpEntries';
import buildAcceptPrpsSuggestion from '../types/acceptPrpsEntries';
import buildAcceptPrpSuggestion from '../types/acceptPrpEntries';
import buildComponentPrpSuggestions from '../types/componentPrpEntries';
import buildScpSuggestion from '../types/scp';
import buildActionSuggestion from '../types/action';
import buildActionEntrySuggestions from '../types/scpActionEntries';
import buildConditionEntrySuggestions from '../types/conditionEntries';
import buildTriggerSuggestion from '../types/trigger';
import buildScpTriggerEntrySuggestions from '../types/scpTriggerEntries';
import buildScpEntrySuggestions from '../types/scpEntries';
import buildFlowEntrySuggestions from '../types/flowEntries';
import buildAuthSuggestions from '../types/authEntries';
import buildBranchSuggestions from '../types/branchEntries';
import buildGenericObjectSuggestion from './shared/suggestions/buildGenericObjectSuggestion';

// Internal Utils
const build = async (nodes: Nodes, nodeMatchData: NodeMatchData): Promise<null | CompletionItem | CompletionItem[]> => {
	const { node } = nodeMatchData;

	// COMPONENT
	if (nodeHasType(node, NODE_TYPES.COMPONENT))
		return buildComponentSuggestion(nodeMatchData, nodes);

	// COMPONENT ENTRY
	if (nodeHasType(node, NODE_TYPES.COMPONENT_ENTRY))
		return buildComponentEntrySuggestions(nodeMatchData, nodes);

	// TRAIT
	if (nodeHasType(node, NODE_TYPES.TRAIT))
		return buildComponentTraitSuggestion(nodeMatchData, nodes);

	// TRAIT ENTRY
	if (nodeHasType(getNodeParent(node, nodes), NODE_TYPES.TRAIT))
		return buildTraitEntrySuggestion(nodeMatchData, nodes);

	// TRAIT PRP
	if (nodeHasType(node, NODE_TYPES.TRAIT_PRP))
		return buildTraitPrpSuggestion(nodeMatchData, nodes);

	// TRAIT DEFINITION ACCEPT PRPS
	if ((nodeHasType(node, NODE_TYPES.TRAIT_ACCEPT_PRP) || nodeHasType(node, NODE_TYPES.TRAIT_UNUSED_SUB_ENTRY)) && !ancestorHasType(node, nodes, NODE_TYPES.PRP))
		return buildAcceptPrpsSuggestion(nodeMatchData, nodes);

	// TRAIT DEFINITION ACCEPT PRP
	if (nodeHasType(node, NODE_TYPES.TRAIT_ACCEPT_SUB_PRP))
		return buildAcceptPrpSuggestion(nodeMatchData, nodes);

	// PRP
	if (nodeHasType(node, NODE_TYPES.PRP))
		return await buildComponentPrpSuggestions(nodeMatchData, nodes);

	// SCP
	if (nodeHasType(node, NODE_TYPES.SCP))
		return buildScpSuggestion(nodeMatchData, nodes);

	// SCP ENTRY
	if (nodeHasType(getNodeParent(node, nodes), NODE_TYPES.SCP))
		return buildScpEntrySuggestions(nodeMatchData, nodes);

	// SCP TRIGGER
	if (nodeHasType(node, NODE_TYPES.SCP_TRIGGER))
		return buildTriggerSuggestion(nodeMatchData, nodes);

	// SCP TRIGGER ENTRY
	if (nodeHasType(getNodeParent(node, nodes), NODE_TYPES.SCP_TRIGGER))
		return await buildScpTriggerEntrySuggestions(nodeMatchData, nodes);

	// SCP ACTION
	if (nodeHasType(node, NODE_TYPES.SCP_ACTION))
		return buildActionSuggestion(nodeMatchData, nodes);

	// SCP ACTION ENTRY
	if (nodeHasType(node, NODE_TYPES.SCP_ACTION_ENTRY))
		return buildActionEntrySuggestions(nodeMatchData, nodes);

	// CONDITION COMPARISON
	if (nodeHasType(node, NODE_TYPES.SCP_ACTION_SUB_ENTRY) && nodeHasType(nodes.get(node.parentPath!)!, NODE_TYPES.CONDITION_ARRAY))
		return buildGenericObjectSuggestion(node, nodes);

	// COMPARISON BRANCH
	if (nodeHasType(node, NODE_TYPES.SCP_ACTION_SUB_ENTRY) && nodes.get(node.parentPath!)!.name === 'branch')
		return buildBranchSuggestions(nodeMatchData, nodes);

	// CONDITION COMPARISON ENTRIES
	if (nodeHasType(node, NODE_TYPES.CONDITION_SUB_ENTRY))
		return buildConditionEntrySuggestions(nodeMatchData, nodes);

	// FLOW
	if (nodeHasType(node, NODE_TYPES.FLOW))
		return buildFlowSuggestion(nodeMatchData, nodes);

	// FLOW ENTRY
	if (nodeHasType(getNodeParent(node, nodes), NODE_TYPES.FLOW))
		return await buildFlowEntrySuggestions(nodeMatchData, nodes);

	// AUTH
	if (nodeHasType(node, NODE_TYPES.COMPONENT_AUTH_ARRAY_ENTRY))
		return buildAuthSuggestions(nodeMatchData, nodes);

	return null;
};

const buildCompletionItems = async (nodes: Nodes, nodeMatchData: NodeMatchData): Promise<null | CompletionItem[]> => {
	const completionItemsDelta: null | CompletionItem | CompletionItem[] = await build(nodes, nodeMatchData);

	let completionItems: null | CompletionItem[];

	if (completionItemsDelta === null)
		completionItems = completionItemsDelta as null;
	else if (!isArray(completionItemsDelta))
		completionItems = [completionItemsDelta] as CompletionItem[];
	else
		completionItems = completionItemsDelta as CompletionItem[];

	return completionItems;
};

export default buildCompletionItems;
