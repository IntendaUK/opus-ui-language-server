// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { NodeMatchData } from '../../../../../../utils/findNodeMatchDataFromFilePosition';
import type { Node, Nodes } from '../../../../../../model';

// Utils
import { getNodeParent } from '../../../../../../utils/nodeRetrievalUtils';
import { nodeHasType } from '../../../../../../utils/buildNodes/setNodeTypes/utils';
import buildCompletionItem from '../../utils/buildCompletionItem';
import buildTypeSuggestions from './utils/buildTypeSuggestions';
import buildGenericStringSuggestion from '../../utils/shared/suggestions/buildGenericStringSuggestion';
import buildGenericArraySuggestion from '../../utils/shared/suggestions/buildGenericArraySuggestion';
import buildGenericObjectSuggestion from '../../utils/shared/suggestions/buildGenericObjectSuggestion';

// Managers
import ServerManager from '../../../../index';

// Config
import { NODE_TYPES } from '../../../../../../utils/buildNodes/setNodeTypes/config';

// Internals
const componentEntries = [
	{ key: 'condition', desc: 'A comparison object which when resolves to true, will render this component. If resolves to false, this component will not be rendered.', type: 'object' },
	{ key: 'id', desc: 'The chosen id for this component.', type: 'string' },
	{ key: 'scope', desc: 'A scope for this component which we can use as an anchor to easily access this component from anywhere and any descendants that have relative ids set on them.', type: 'string' },
	{ key: 'relId', desc: 'A relative id for this component so we can easily target it from anywhere with the help of scopes as an anchor and this relative id as a target.', type: 'string' },
	{ key: 'type', desc: 'The chosen type for this component.', type: 'string' },
	{ key: 'prps', desc: 'An object of properties which will be set for this component.', type: 'object' },
	{ key: 'auth', desc: 'An array of property names that, when redefined by the parent component, will be updated upon remount.', type: 'array' },
	{ key: 'wgts', desc: 'A list of children which will be rendered inside this component.', type: 'array' },
	{ key: 'traits', desc: 'A list of traits that belong to this component.', type: 'array' },
	{ key: 'container', desc: 'An id of the container that this component will be rendered inside.', type: 'array' },
	{ key: 'comment', desc: 'An (optional) comment we wish to give this component, for dev purposes.', type: 'string' },
	{ key: 'comments', desc: 'A list of comments we wish to give this component (for dev purposes).', type: 'array' }
];

const traitDefinitionEntries = [
	{ key: 'acceptPrps', desc: 'An object defining the properties that this trait definition should accept.', type: 'object' }
];

const getFilteredComponentEntries = (node: Node, nodes: Nodes) => {
	const isFile = nodeHasType(getNodeParent(node, nodes), NODE_TYPES.FILE);

	if (!isFile)
		return componentEntries;

	const startupDashboard = nodes.get(`${ServerManager.paths.opusAppMdaPath}/dashboard/index.json/startup`)?.value;

	if (node.filePath === `${ServerManager.paths.opusAppMdaPath}/dashboard/${startupDashboard}.json`)
		return componentEntries;

	return [...traitDefinitionEntries, ...componentEntries];
};

// Internal Utils
const buildKeyCompletionItems = (node: Node, nodes: Nodes): CompletionItem[] => {
	const entries = getFilteredComponentEntries(node, nodes);

	const completionItems = entries.map(e => {
		const completionItem: CompletionItem = buildCompletionItem(node, 'KEY', e.key, null, e.type, e.type, e.desc, nodes);

		return completionItem;
	});

	return completionItems;
};

const buildValueCompletionItems = (node: Node, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	if (node.name === 'acceptPrps')
		return buildGenericObjectSuggestion(node, nodes);

	if (node.name === 'auth')
		return buildGenericArraySuggestion(node, nodes);

	if (node.name === 'comment') 
		return buildGenericStringSuggestion(node, nodes);

	if (node.name === 'comments') 
		return buildGenericArraySuggestion(node, nodes);

	if (node.name === 'scope')
		return buildGenericStringSuggestion(node, nodes);

	if (node.name === 'id')
		return buildGenericStringSuggestion(node, nodes);

	if (node.name === 'relId')
		return buildGenericStringSuggestion(node, nodes);

	if (node.name === 'type')
		return buildTypeSuggestions(node, nodes);

	if (node.name === 'condition')
		return buildGenericObjectSuggestion(node, nodes);

	if (node.name === 'prps') 
		return buildGenericObjectSuggestion(node, nodes);

	if (node.name === 'traits')
		return buildGenericArraySuggestion(node, nodes);

	if (node.name === 'wgts')
		return buildGenericArraySuggestion(node, nodes);

	return null;
};

// Implementation
const buildComponentPropSuggestions = (nodeMatchData: NodeMatchData, nodes: Nodes): null | CompletionItem | CompletionItem[] => {
	const { matchedOn, node } = nodeMatchData!;

	let completionItems: null | CompletionItem | CompletionItem[] = null;

	if (matchedOn === 'KEY')
		completionItems = buildKeyCompletionItems(node, nodes);
	else if (matchedOn === 'VALUE')
		completionItems = buildValueCompletionItems(node, nodes);

	return completionItems;
};

export default buildComponentPropSuggestions;
