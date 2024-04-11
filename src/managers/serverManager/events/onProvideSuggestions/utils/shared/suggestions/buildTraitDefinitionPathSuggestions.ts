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
		.filter(n => nodeHasType(n, NODE_TYPES.TRAIT_UNUSED) || nodeHasType(n, NODE_TYPES.TRAIT_DEFINITION))
		.filter(n => n.filePath !== node.filePath);

	const traitDefinitionPaths = traitDefinitionNodes
		.map(n => {
			const opusEnsemblePaths = ServerManager.paths.opusEnsemblePaths;

			const matchedEnsemble = Array.from(opusEnsemblePaths.entries()).find(e => n.path.startsWith(e[1]));
			
			if (matchedEnsemble) {
				const [ensembleName, ensemblePath] = matchedEnsemble;

				const path = `@${ensembleName}${n.path.replace(ensemblePath, '').replace('.json', '')}`;
				
				return {
					name: ensembleName,
					path
				};
			}

			const path = n.path
				.replace(`${ServerManager.paths.opusAppMdaPath}/dashboard/`, '')
				.replace('.json', '');

			return {
				name: 'internal',
				path
			};
		});

	const completionItems: CompletionItem[] = traitDefinitionPaths.map(({ name, path }, i) => {
		return buildCompletionItem(
			node,
			'VALUE',
			path,
			null,
			name,
			'string',
			`### Full path\n\`${traitDefinitionNodes[i].filePath}\`\n### Relative path\n\`${getRelativePathFromAbsoluteFilePath(traitDefinitionNodes[i].filePath!)}\`\n### Component value\n\`\`\`json\n${JSON.stringify(traitDefinitionNodes[i].value, null, 2)}\n\`\`\``,
			nodes
		);
	});

	return completionItems;
};

export default buildTraitDefinitionPathSuggestions;
