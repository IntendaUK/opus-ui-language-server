// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { Node, Nodes } from '../../../../../../../model';

// Config
import { NODE_TYPES } from '../../../../../../../utils/buildNodes/setNodeTypes/config';

// Utils
import { nodeHasType } from '../../../../../../../utils/buildNodes/setNodeTypes/utils';
import { getRelativePathFromAbsoluteFilePath } from '../../../../../../../utils/pathUtils';
import buildCompletionItem from '../../buildCompletionItem';

// Managers
import ServerManager from '../../../../../index';

// Implementation
const buildTraitDefinitionPathSuggestions = (node: Node, nodes: Nodes): CompletionItem[] => {
	const traitDefinitionNodes = Array.from(ServerManager.caches.nodes.values())
		.filter(n => nodeHasType(n, NODE_TYPES.TRAIT_UNUSED) || nodeHasType(n, NODE_TYPES.TRAIT_DEFINITION));

	const traitDefinitionPaths = traitDefinitionNodes
		.filter(n => n.filePath !== node.filePath)
		.map(n => {
			let path;

			const matchedEnsemblePath = Array.from(ServerManager.paths.opusEnsemblePaths.values()).find(p => n.path.startsWith(p));

			const isEnsemble = !!matchedEnsemblePath;

			if (isEnsemble) {
				path = `@${n.path
					.replace(`${matchedEnsemblePath.substring(0, matchedEnsemblePath.lastIndexOf('/'))}/`, '')
					.replace('.json', '')}`;
			} else {
				path = n.path
					.replace(`${ServerManager.paths.opusAppMdaPath}/dashboard/`, '')
					.replace('.json', '');
			}

			return path;
		});

	const completionItems: CompletionItem[] = traitDefinitionPaths.map((path, i) => {
		return buildCompletionItem(
			node,
			'VALUE',
			path,
			null,
			'string',
			'string',
			`### Full path\n\`${traitDefinitionNodes[i].filePath}\`\n### Relative path\n\`${getRelativePathFromAbsoluteFilePath(traitDefinitionNodes[i].filePath!)}\`\n### Component value\n\`\`\`json\n${JSON.stringify(traitDefinitionNodes[i].value, null, 2)}\n\`\`\``,
			nodes
		);
	});

	return completionItems;
};

export default buildTraitDefinitionPathSuggestions;
