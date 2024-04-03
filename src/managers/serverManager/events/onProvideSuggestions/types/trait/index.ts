// Utils
import buildGenericObjectSuggestion from '../../utils/shared/suggestions/buildGenericObjectSuggestion';
import buildTraitDefinitionPathSuggestions from '../../utils/shared/suggestions/buildTraitDefinitionPathSuggestions';

// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';
import type { Nodes } from '../../../../../../model';

// Implementation
const buildComponentTraitSuggestion = (nodeMatchData: NodeMatchData, nodes: Nodes): CompletionItem[] => {
	const { node } = nodeMatchData!;

	const completionItems = buildTraitDefinitionPathSuggestions(node, nodes);

	if (node.value !== '')
		completionItems.unshift(buildGenericObjectSuggestion(node, nodes, 'VALUE'));

	return completionItems;
};

export default buildComponentTraitSuggestion;
