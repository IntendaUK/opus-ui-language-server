// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';
import type { Node, Nodes } from '../../../../../../model';
import type { ScpEntryItemData } from '../../../../../../utils/getDataFromScpEntryItemConfig';

// Utils
import buildCompletionItem from '../../utils/buildCompletionItem';
import getDataFromScpEntryItemConfig from '../../../../../../utils/getDataFromScpEntryItemConfig';
import buildCpnPrpKeyFromKeyOrToKeySuggestions from '../../utils/shared/suggestions/buildCpnPrpKeyFromKeyOrToKeySuggestions';
import buildGenericStringSuggestion from '../../utils/shared/suggestions/buildGenericStringSuggestion';
import buildIdSuggestions from '../../utils/shared/suggestions/buildIdSuggestions';
import buildScpEntryItemValueSuggestions from '../../utils/shared/suggestions/buildScpEntryItemValueSuggestions';
import getScpEntryConfig from '../../utils/shared/utils/getScpEntryConfig';
import buildEventSuggestions from './utils/buildEventSuggestions';

// Internals
import { extraTriggerKeys } from '../../../../../../utils/buildInitialCaches/buildOpusTriggers';

// Internal Utils
const buildKeyCompletionItems = (node: Node, nodes: Nodes): CompletionItem | CompletionItem[] => {
	const eventTriggerConfig = getScpEntryConfig(node, nodes, 'opusTriggersMap');
	if (!eventTriggerConfig) {
		const { key, type, desc } = extraTriggerKeys[0];
		return buildCompletionItem(node, 'KEY', key, type as string, null, type as string, desc, nodes);
	}

	const completionItems = eventTriggerConfig.keys.map(e => {
		const suggestionData: ScpEntryItemData = getDataFromScpEntryItemConfig(e);

		const { suggestion, suggestionDetail, suggestionDescription, suggestionDocumentation } = suggestionData;

		return buildCompletionItem(node, 'KEY', suggestion, suggestionDetail, suggestionDescription, 'string', suggestionDocumentation, nodes);

	});

	return completionItems;
};

const buildValueCompletionItems = async (node: Node, nodes: Nodes): Promise<null | CompletionItem | CompletionItem[]> => {
	if (node.name === 'event')
		return buildEventSuggestions(node, nodes);

	const eventTriggerConfig = getScpEntryConfig(node, nodes, 'opusTriggersMap');
	if (!eventTriggerConfig)
		return null;

	if (node.name === 'source')
		return buildIdSuggestions(node, nodes);

	if (node.name === 'sourceTag')
		return buildGenericStringSuggestion(node, nodes);

	if (node.name === 'key')
		return await buildCpnPrpKeyFromKeyOrToKeySuggestions(node, nodes, 'source');

	return buildScpEntryItemValueSuggestions(node, nodes, eventTriggerConfig);
};

// Implementation
const buildScpPropSuggestions = async (nodeMatchData: NodeMatchData, nodes: Nodes): Promise<null | CompletionItem | CompletionItem[]> => {
	const { matchedOn, node } = nodeMatchData!;

	let completionItems: null | CompletionItem | CompletionItem[] = null;

	if (matchedOn === 'KEY')
		completionItems = buildKeyCompletionItems(node, nodes);
	else if (matchedOn === 'VALUE')
		completionItems = await buildValueCompletionItems(node, nodes);

	return completionItems;
};

export default buildScpPropSuggestions;
