// Utils
import { getAbsolutePathFromUri } from './pathUtils';
import { getNodeParent } from './nodeRetrievalUtils';

// Model
import type { Position } from 'vscode-languageserver';
import type { Node, Nodes } from '../model';

// Managers
import ServerManager from '../managers/serverManager';

// Internal Model
export type NodeMatchData = { matchedOn: null | 'KEY' | 'VALUE', node: Node };

// Implementation
const findNodeMatchDataFromFilePosition = (fileUri: string, nodes: Nodes, position: Position): null | NodeMatchData => {
	const { line: fileLineIndex } = position;

	const filePath = getAbsolutePathFromUri(fileUri);

	const fileNodes = Array.from(nodes.values()).filter(n => !!n.filePath && n.filePath === filePath);

	const matchedNode = fileNodes.find(n => n.fileLineMapping!.lineIndex === fileLineIndex)!;

	const { lineStringFlags, lineKeyPosition, lineValuePosition } = matchedNode.fileLineMapping!;

	if (lineStringFlags.lineIsObjectEntry) {
		if (position.character >= 0 && position.character <= lineKeyPosition.characterEndIndex ) {
			return {
				matchedOn: 'KEY',
				node: matchedNode
			};
		}

		if (position.character >= lineKeyPosition.characterEndIndex && position.character <= lineValuePosition.characterEndIndex ) {
			return {
				matchedOn: 'VALUE',
				node: matchedNode
			};
		}

		return {
			matchedOn: 'KEY',
			node: getNodeParent(matchedNode, ServerManager.caches.nodes)!
		};
	}

	return {
		matchedOn: 'VALUE',
		node: matchedNode
	};
};

export default findNodeMatchDataFromFilePosition;
