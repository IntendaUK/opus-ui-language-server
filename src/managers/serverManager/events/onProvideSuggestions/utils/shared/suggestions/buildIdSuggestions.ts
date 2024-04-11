// Utils
import { getAllComponentNodesWithIdScopeOrRelIdMatches } from '../../../../../../../utils/componentIdOrScopeUtils';
import { getRelativePathFromAbsoluteFilePath } from '../../../../../../../utils/pathUtils';
import findNodeComponentType from '../../../../../../../utils/findTypes/findNodeComponentType';
import buildCompletionItem from '../../buildCompletionItem';
import buildGenericStringSuggestion from './buildGenericStringSuggestion';

// Model
import type { Node, Nodes } from '../../../../../../../model';
import type { CompletionItem } from 'vscode-languageserver';

// Implementation
const buildCompletionItems = (node: Node, nodes: Nodes) => {
	const completionItems: CompletionItem[] = [];
	const scopeIdRelIdMatchesForAllNodes = getAllComponentNodesWithIdScopeOrRelIdMatches(nodes);

	scopeIdRelIdMatchesForAllNodes.map(({ node: n, matches }) => {
		const relativePath = getRelativePathFromAbsoluteFilePath(n.filePath!);

		const componentNodeTypes = findNodeComponentType(nodes, n);
		const componentTypeString = !componentNodeTypes.length ? 'NO TYPE' : componentNodeTypes.length > 1 ? `MULTIPLE TYPES: [${componentNodeTypes.join(', ')}]` : componentNodeTypes[0];
		const componentDocumentation = `### Full path\n\`${n.filePath}\`\n### Relative path\n\`${relativePath}\`\n### Component value\n\`\`\`json\n${JSON.stringify(n.value, null, 2)}\n\`\`\``;

		matches.forEach(m => {
			if (m.matchedOn === 'relId') {
				m.matchedValues!.forEach(scopeAndRelId => {
					completionItems.push(buildCompletionItem(
						node,
						'VALUE',
						scopeAndRelId,
						relativePath,
						componentTypeString,
						'string',
						componentDocumentation,
						nodes
					));
				});
			} else {
				completionItems.push(buildCompletionItem(
					node,
					'VALUE',
					m.matchedOn === 'scope' ? `||${m.matchedValue}||` : m.matchedValue,
					relativePath,
					componentTypeString,
					'string',
					componentDocumentation,
					nodes
				));
			}
		});
	});

	return completionItems;
};

const buildIdSuggestions = (node: Node, nodes: Nodes): CompletionItem | CompletionItem[] => {
	const completionItems = buildCompletionItems(node, nodes);

	if (!completionItems.length)
		return buildGenericStringSuggestion(node, nodes);

	return completionItems;
};

export default buildIdSuggestions;
