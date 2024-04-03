// Utils
import fileIsOutsideScope from '../../../utils/fileIsOutsideScope';
import { getAbsolutePathFromUri } from '../../../utils/pathUtils';
import { handlerOnFileCreated } from '../../../utils/buildNodes/nodeEventHandlerUtils';

// Model
import type { DidSaveTextDocumentParams } from 'vscode-languageserver';

// Managers
import ServerManager from '../index';

/*
	Note: Sending diagnostics/updating of caches would have been done inside the onFileModified event first.
	This will only update caches when the file has been deleted externally but still open in the editor and then saved later.
 */

// Implementation
const onFileSaved = async (params: DidSaveTextDocumentParams) => {
	const { textDocument: { uri: fileUri }, text: fileContentString } = params;

	ServerManager.documents.set(fileUri, fileContentString!);

	if (fileIsOutsideScope(fileUri))
		return;

	const fileNodeExistsInNodesMap = ServerManager.caches.nodes.has(getAbsolutePathFromUri(fileUri));
	if (fileNodeExistsInNodesMap)
		return;

	handlerOnFileCreated(fileUri, fileContentString!);
};

export default onFileSaved;
