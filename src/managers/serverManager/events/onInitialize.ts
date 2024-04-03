// Plugins
import { TextDocumentSyncKind } from 'vscode-languageserver/node';

// Model
import type { InitializeResult } from 'vscode-languageserver/node';
import type { ServerCapabilities } from 'vscode-languageserver-protocol/lib/common/protocol';
import type { InitializeParams } from 'vscode-languageserver';

export let SERVER_INIT_PARAMS: InitializeParams = null!;

// Implementation
const onInitialize = async (params: InitializeParams): Promise<InitializeResult> => {

	console.log('onInitialize...');

	if (!params.rootUri)
		throw new Error('Could not start the Opus UI language server. Variable "rootUri" was falsy.');

	SERVER_INIT_PARAMS = params;

	const result: ServerCapabilities = {
		textDocumentSync: {
			openClose: true,
			change: TextDocumentSyncKind.Full,
			willSave: true,
			save: {
				includeText: true
			}
		},
		foldingRangeProvider: false,
		completionProvider: {
			resolveProvider: false,
			triggerCharacters: [
				'"',
				'\n',
				'\t',
				' ',
				':',
				'|'
			]
		},
		hoverProvider: true
	};

	return {
		capabilities: result
	};
};

export default onInitialize;
