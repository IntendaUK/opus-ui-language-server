// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';
import type { Nodes } from '../../../../../../model';

// Implementation
const buildWgtSuggestions = (nodeMatchData: NodeMatchData, nodes: Nodes): null | CompletionItem[] => {
	console.log('HIT WGTS ARRAY!');

	return [];
};

export default buildWgtSuggestions;
