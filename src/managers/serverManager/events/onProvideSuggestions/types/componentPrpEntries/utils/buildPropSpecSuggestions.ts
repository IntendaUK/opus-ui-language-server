// Plugins
import { CompletionItemKind } from 'vscode-languageserver';

// Utils
import buildCompletionItem from '../../../utils/buildCompletionItem';
import buildGenericBooleanSuggestion from '../../../utils/shared/suggestions/buildGenericBooleanSuggestion';
import buildGenericArraySuggestion from '../../../utils/shared/suggestions/buildGenericArraySuggestion';
import buildGenericObjectSuggestion from '../../../utils/shared/suggestions/buildGenericObjectSuggestion';
import buildGenericStringSuggestion from '../../../utils/shared/suggestions/buildGenericStringSuggestion';

// Model
import type { ComponentPropSpecs, JSONArray, JSONObject, PropSpec } from '../../../../../../../model';
import type { CompletionItem } from 'vscode-languageserver';
import type { Node, Nodes } from '../../../../../../../model';

// Managers
import ServerManager from '../../../../../index';

// Local Helpers
const buildOptionsCompletionItems = (node: Node, nodes: Nodes, propSpec: PropSpec) => {
	const { options, type } = propSpec;

	const optionsDelta: string[] = [];

	if (options)
		optionsDelta.push(...options);

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

const buildColorOptions = (node: Node, nodes: Nodes, propSpec: PropSpec) => {
	const colorThemes = nodes.get(`${ServerManager.paths.opusAppPackagePath}/opusUiColorThemes`);
	if (!colorThemes || colorThemes.valueType !== 'array')
		return buildGenericStringSuggestion(node, nodes);

	const colorOptions: { theme: string; colorKey: string, colorValue: string, suggestion: string }[] = [];

	(colorThemes.value as JSONArray).forEach(colorTheme => {
		if (!colorTheme || typeof colorTheme !== 'string')
			return;

		const themeNode = nodes.get(`${ServerManager.paths.opusAppMdaPath}/theme/${colorTheme}.json`);
		if (!themeNode || themeNode.valueType !== 'object')
			return;

		const entries = Object.entries(themeNode.value as JSONObject)
			.filter(([colorKey, colorValue]) => {
				if (colorKey === 'themeConfig')
					return false;

				if (!colorValue || typeof colorValue !== 'string')
					return false;

				return true;

			})
			.map(([k, v]) => {
				return {
					theme: colorTheme,
					colorKey: k,
					colorValue: v as string,
					suggestion: `{theme.${colorTheme}.${k}}`
				};
			});

		colorOptions.push(...entries);
	});

	if (!colorOptions.length)
		return buildGenericStringSuggestion(node, nodes);

	const completionItems: CompletionItem[] = colorOptions.map(({ colorKey, colorValue, suggestion }) => buildCompletionItem(
		node,
		'VALUE',
		colorValue,
		colorKey,
		suggestion,
		'string',
		propSpec.desc,
		nodes,
		suggestion,
		CompletionItemKind.Color
	));

	return completionItems;
};

// Implementation
const buildPropSpecSuggestions = (componentPropSpecs: ComponentPropSpecs, node: Node, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	const propSpec: null | PropSpec = componentPropSpecs.get(node.name) || null;

	if (!propSpec)
		return null;

	const { options, type } = propSpec;

	if (options && options.length)
		return buildOptionsCompletionItems(node, nodes, propSpec);
	else if (type === 'boolean')
		return buildGenericBooleanSuggestion(node, nodes);
	else if (type === 'array')
		return buildGenericArraySuggestion(node, nodes);
	else if (type === 'object')
		return buildGenericObjectSuggestion(node, nodes);
	else if (type === 'string') {
		if (node.name.toLowerCase().includes('color'))
			return buildColorOptions(node, nodes, propSpec);

		return buildGenericStringSuggestion(node, nodes);
	}

	return null;
};

export default buildPropSpecSuggestions;
