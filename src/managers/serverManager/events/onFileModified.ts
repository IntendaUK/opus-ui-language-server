// Model
import type { DidChangeTextDocumentParams } from 'vscode-languageserver';

// Utils
import {
	handlerOnFileModified,
	handlerOnOpusUiConfigFileModified,
	handlerOnPackageJsonFileModified
} from '../../../utils/buildNodes/nodeEventHandlerUtils';
import { getAbsolutePathFromUri } from '../../../utils/pathUtils';
import fileIsOutsideScope from '../../../utils/fileIsOutsideScope';

// Managers
import ServerManager from '../index';

// Implementation
const onFileModified = async (params: DidChangeTextDocumentParams) => {
	const { textDocument: { uri: fileUri }, contentChanges: [{ text: fileContentString }] } = params;

	ServerManager.documents.set(fileUri, fileContentString);

	if (fileIsOutsideScope(fileUri))
		return;

	const filePath = getAbsolutePathFromUri(fileUri);

	if (filePath === ServerManager.paths.opusAppPackagePath)
		await handlerOnPackageJsonFileModified(fileUri, fileContentString);
	else if (filePath === ServerManager.paths.externalOpusUiConfigPath)
		await handlerOnOpusUiConfigFileModified(fileUri, fileContentString);
	else
		await handlerOnFileModified(fileUri, fileContentString);

};

export default onFileModified;
