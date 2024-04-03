// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';
import type { Node, Nodes, ScpEntryConfig } from '../../../../../../model';
import type { ScpEntryItemData } from '../../../../../../utils/getDataFromScpEntryItemConfig';

// Utils
import buildCompletionItem from '../../utils/buildCompletionItem';
import buildScpEntryItemValueSuggestions from '../../utils/shared/suggestions/buildScpEntryItemValueSuggestions';
import getDataFromScpEntryItemConfig from '../../../../../../utils/getDataFromScpEntryItemConfig';
import buildActionTypeSuggestions from './utils/buildOperatorSuggestions';
import getScpEntryConfig from '../../utils/shared/utils/getScpEntryConfig';

// Managers
import ServerManager from '../../../../index';

// Internal
import { extraOperatorKeys } from '../../../../../../utils/buildInitialCaches/buildOpusOperators';

// Local Internals
const includeApplyComparisonKeys = [
	'branch',
	'source',
	'actionCondition',
	'comment',
	'comments',
	'inlineKeys'
];

// Internal Utils
const getKeysWithApplyComparisonKeys = (conditionOperatorConfig: ScpEntryConfig): ScpEntryConfig => {
	if (!ServerManager.caches.opusActionsMap.has('applyComparison'))
		return conditionOperatorConfig;

	const { keys: operatorKeys, ...config } = conditionOperatorConfig;
	const { keys: applyComparisonOperatorKeys } = ServerManager.caches.opusActionsMap.get('applyComparison')!;

	const res = {
		...config,
		keys: [
			...operatorKeys,
			...applyComparisonOperatorKeys.filter(e => includeApplyComparisonKeys.includes(e.key))
		]
	};

	return res;
};

export const buildConditionEntrySuggestionKeys = (node: Node, nodes: Nodes, isForApplyComparisonAction = false): CompletionItem | CompletionItem[] => {
	let conditionOperatorConfig = getScpEntryConfig(node, nodes, 'opusOperatorsMap');
	if (!conditionOperatorConfig) {
		const { key, type, desc } = extraOperatorKeys[0];
		return buildCompletionItem(node, 'KEY', key, type as string, null, type as string, desc, nodes);
	}

	if (isForApplyComparisonAction) 
		conditionOperatorConfig = getKeysWithApplyComparisonKeys(conditionOperatorConfig);

	const completionItems = conditionOperatorConfig.keys.map(e => {
		const suggestionData: ScpEntryItemData = getDataFromScpEntryItemConfig(e);

		const { suggestion, suggestionDetail, suggestionDescription, suggestionDocumentation } = suggestionData;

		return buildCompletionItem(node, 'KEY', suggestion, suggestionDetail, suggestionDescription, 'string', suggestionDocumentation, nodes);
	});

	return completionItems;
};

export const buildConditionEntrySuggestionValues = async (node: Node, nodes: Nodes, isForApplyComparisonAction = false): Promise<null | CompletionItem | CompletionItem[]> => {
	if (node.name === 'operator')
		return buildActionTypeSuggestions(node, nodes);

	let conditionOperatorConfig = getScpEntryConfig(node, nodes, 'opusOperatorsMap');
	if (!conditionOperatorConfig)
		return null;

	if (isForApplyComparisonAction) 
		conditionOperatorConfig = getKeysWithApplyComparisonKeys(conditionOperatorConfig);
	
	return buildScpEntryItemValueSuggestions(node, nodes, conditionOperatorConfig);
};

// Implementation
const buildScpActionSuggestions = async (nodeMatchData: NodeMatchData, nodes: Nodes): Promise<null | CompletionItem | CompletionItem[]> => {
	const { matchedOn, node } = nodeMatchData!;

	let completionItems: null | CompletionItem | CompletionItem[] = null;

	if (matchedOn === 'KEY')
		completionItems = buildConditionEntrySuggestionKeys(node, nodes);
	else if (matchedOn === 'VALUE')
		completionItems = await buildConditionEntrySuggestionValues(node, nodes);

	return completionItems;
};

export default buildScpActionSuggestions;
