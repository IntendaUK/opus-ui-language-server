// Plugins
import { CompletionItemKind } from 'vscode-languageserver';

// Model
import type { CompletionItem } from 'vscode-languageserver';
import type { Node, Nodes } from '../../../../../model';

// Internals
import { PLACEHOLDER_KEY, PLACEHOLDER_VALUE } from './buildDummyNodes';

// Internal Model
type CompletionItemType = 'KEY' | 'VALUE'

// Internal Utils
const buildInsertText = (node: Node, type: CompletionItemType, suggestion: string, labelType: string, nodes: Nodes): string => {
	const { lineString, lineStringKey, lineStringValue, lineStringFlags: { lineIsObjectEntry, valueIsEmptyString } } = node.fileLineMapping!;

	const lineStringDelta = type === 'KEY' ? lineStringKey : lineStringValue;
	const placeholderDelta = type === 'KEY' ? PLACEHOLDER_KEY : PLACEHOLDER_VALUE;

	let insertText;

	if (type === 'VALUE' && labelType === 'array')
		insertText = '[\n\t$0\n]';
	else if (type === 'VALUE' && labelType === 'object')
		insertText = '{\n\t$0\n}';
	else
		insertText = suggestion;

	if ((type === 'KEY' || (type === 'VALUE' && !['array', 'object'].includes(labelType))) && lineStringDelta === placeholderDelta)
		insertText = suggestion === '""' || (type === 'VALUE' && labelType === 'boolean') ? suggestion : `"${suggestion}"`;

	if (lineIsObjectEntry && !valueIsEmptyString && type === 'VALUE' && lineString[lineString.indexOf(lineStringValue) - 1] !== ' ')
		insertText = ` ${insertText}`;

	return insertText;
};

// Implementation
const buildCompletionItem = (
	node: Node,
	type: CompletionItemType,
	suggestion: string,
	labelDetail: null | string,
	labelDescription: null | string,
	labelType: string,
	documentation: null | string,
	nodes: Nodes
): CompletionItem => {
	const insertText: undefined | string = buildInsertText(node, type, suggestion, labelType, nodes);

	const completionItem: CompletionItem = {
		insertText,
		insertTextFormat: 2,
		label: suggestion,
		labelDetails: {},
		kind: CompletionItemKind.Value
	};

	if (documentation) {
		completionItem.detail = suggestion;
		completionItem.documentation = {
			kind: 'markdown',
			value: documentation
		};
	}

	if (labelDetail)
		completionItem.labelDetails!.detail = ' ' + labelDetail;

	if (labelDescription)
		completionItem.labelDetails!.description = labelDescription;

	const deltaIsEmptyString = type === 'KEY'
		? node.fileLineMapping!.lineStringFlags!.keyIsEmptyString
		: node.fileLineMapping!.lineStringFlags!.valueIsEmptyString;

	if (deltaIsEmptyString && insertText === '""') {
		// Filter out invalid empty string suggestions.
		// @ts-ignore
		completionItem.forceRemove = true;
	}

	return completionItem;
};

export default buildCompletionItem;
