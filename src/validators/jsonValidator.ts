// Plugins
import { getLanguageService } from 'vscode-json-languageservice';

// Model
import { TextDocument } from 'vscode-languageserver-textdocument';
import type { Diagnostic, DocumentLanguageSettings, JSONDocument } from 'vscode-json-languageservice';

// Local Internals
const JsonService = getLanguageService({});

// Implementation
const jsonValidator = async (fileUri: string, fileContentString: string) => {
	const textDocument = TextDocument.create(fileUri, 'json', 0, fileContentString);

	const jsonDocument: JSONDocument = JsonService.parseJSONDocument(textDocument);

	const documentSettings: DocumentLanguageSettings = { comments: 'error', trailingCommas: 'error' };

	const jsonDiagnostics: Diagnostic[] = await JsonService.doValidation(textDocument, jsonDocument, documentSettings);

	return jsonDiagnostics;
};

export default jsonValidator;
