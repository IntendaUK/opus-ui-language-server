// Utils
import buildGenericObjectSuggestion from '../../utils/shared/suggestions/buildGenericObjectSuggestion';

// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';
import type { Nodes } from '../../../../../../model';

// Implementation
const buildComponentSuggestion = (nodeMatchData: NodeMatchData, nodes: Nodes): null | CompletionItem => {
	const { node } = nodeMatchData!;

	return buildGenericObjectSuggestion(node, nodes);
};

export default buildComponentSuggestion;
