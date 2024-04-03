// Utils
import buildCompletionItem from '../../../utils/buildCompletionItem';

// Model
import type { ComponentPropSpecs, PropSpec } from '../../../../../../../model';
import type { CompletionItem } from 'vscode-languageserver';
import type { Node, Nodes } from '../../../../../../../model';

// Implementation
const buildPropSpecSuggestions = (componentPropSpecs: ComponentPropSpecs, node: Node, nodes: Nodes): null | CompletionItem[] => {
	const propSpec: null | PropSpec = componentPropSpecs.get(node.name) || null;

	if (!propSpec)
		return null;

	const { options, type } = propSpec;

	const optionsDelta: string[] = [];

	if (options)
		optionsDelta.push(...options);
	else if (type === 'boolean')
		optionsDelta.push('true', 'false');

	if (!optionsDelta.length)
		return null;

	const completionItems: CompletionItem[] = optionsDelta.map((option: string) => buildCompletionItem(
		node,
		'VALUE',
		option,
		null,
		null,
		type,
		propSpec.desc,
		nodes
	));

	return completionItems;
};

export default buildPropSpecSuggestions;
