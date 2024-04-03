// Utils
import buildGenericObjectSuggestion from '../../utils/shared/suggestions/buildGenericObjectSuggestion';

// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';
import type { Nodes } from '../../../../../../model';

// Implementation
const buildFlowSuggestion = (nodeMatchData: NodeMatchData, nodes: Nodes): CompletionItem => {
	const { node } = nodeMatchData!;

	return buildGenericObjectSuggestion(node, nodes);
};

export default buildFlowSuggestion;