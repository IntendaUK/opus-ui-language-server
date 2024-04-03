// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';
import type { Node, Nodes } from '../../../../../../model';
import type { ScpEntryItemData } from '../../../../../../utils/getDataFromScpEntryItemConfig';

// Utils
import { buildConditionEntrySuggestionKeys, buildConditionEntrySuggestionValues } from '../conditionEntries';
import buildCompletionItem from '../../utils/buildCompletionItem';
import buildCpnPrpSpecValueSuggestions from '../../utils/shared/suggestions/buildCpnPrpSpecValueSuggestions';
import buildCpnPrpKeyFromKeyOrToKeySuggestions from '../../utils/shared/suggestions/buildCpnPrpKeyFromKeyOrToKeySuggestions';
import buildIdSuggestions from '../../utils/shared/suggestions/buildIdSuggestions';
import buildScpEntryItemValueSuggestions from '../../utils/shared/suggestions/buildScpEntryItemValueSuggestions';
import getDataFromScpEntryItemConfig from '../../../../../../utils/getDataFromScpEntryItemConfig';
import buildActionTypeSuggestions from './utils/buildActionTypeSuggestions';
import getScpEntryConfig from '../../utils/shared/utils/getScpEntryConfig';

// Internals
import { extraActionKeys } from '../../../../../../utils/buildInitialCaches/buildOpusActions';

// Internal Utils
const buildKeyCompletionItems = (node: Node, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	const eventActionConfig = getScpEntryConfig(node, nodes, 'opusActionsMap');
	if (!eventActionConfig) {
		const { key, type, desc } = extraActionKeys[0];
		return buildCompletionItem(node, 'KEY', key, type as string, null, type as string, desc, nodes);
	}

	if (eventActionConfig.key === 'applyComparison') 
		return buildConditionEntrySuggestionKeys(node, nodes, true);

	const completionItems = eventActionConfig.keys.map(e => {
		const suggestionData: ScpEntryItemData = getDataFromScpEntryItemConfig(e);

		const { suggestion, suggestionDetail, suggestionDescription, suggestionDocumentation } = suggestionData;

		return buildCompletionItem(node, 'KEY', suggestion, suggestionDetail, suggestionDescription, 'string', suggestionDocumentation, nodes);

	});

	return completionItems;
};

const buildValueCompletionItems = async (node: Node, nodes: Nodes): Promise<null | CompletionItem | CompletionItem[]> => {
	if (node.name === 'type')
		return buildActionTypeSuggestions(node, nodes);

	const eventActionConfig = getScpEntryConfig(node, nodes, 'opusActionsMap');
	if (!eventActionConfig)
		return null;

	if (node.name === 'source')
		return buildIdSuggestions(node, nodes);

	if (node.name === 'target')
		return buildIdSuggestions(node, nodes);

	if (node.name === 'key')
		return await buildCpnPrpKeyFromKeyOrToKeySuggestions(node, nodes, eventActionConfig.key === 'applyComparison' ? 'source' : 'target');

	if (node.name === 'value')
		return await buildCpnPrpSpecValueSuggestions(node, nodes, 'target');

	if (eventActionConfig.key === 'applyComparison')
		return buildConditionEntrySuggestionValues(node, nodes, true);

	return buildScpEntryItemValueSuggestions(node, nodes, eventActionConfig);
};

// Implementation
const buildScpActionSuggestions = async (nodeMatchData: NodeMatchData, nodes: Nodes): Promise<null | CompletionItem | CompletionItem[]> => {
	const { matchedOn, node } = nodeMatchData!;

	let completionItems: null | CompletionItem | CompletionItem[] = null;

	if (matchedOn === 'KEY')
		completionItems = buildKeyCompletionItems(node, nodes);
	else if (matchedOn === 'VALUE')
		completionItems = await buildValueCompletionItems(node, nodes);

	return completionItems;
};

export default buildScpActionSuggestions;
