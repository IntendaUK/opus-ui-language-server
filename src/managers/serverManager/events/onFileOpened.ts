// Utils
import { getAbsolutePathFromUri } from '../../../utils/pathUtils';
import { handlerOnFileCreated, handlerOnFileOpened } from '../../../utils/buildNodes/nodeEventHandlerUtils';
import fetchFile from '../../../utils/fetchFile';
import fileIsOutsideScope from '../../../utils/fileIsOutsideScope';
import switchToOpusUiAppAndReloadCachesIfRequired from '../../../utils/buildCachesForOpusUiAppIfRequired';

// Model
import type { DidOpenTextDocumentParams } from 'vscode-languageserver';

// Managers
import ServerManager from '../index';

/*
	Note: the client can call this event (onFileOpened) before it
	calls onCreatedFile which is why we support creating new files in here.
 */

// Implementation
const onFileOpened = async (params: DidOpenTextDocumentParams) => {
	const { textDocument: { uri: fileUri, text: fileContentString } } = params;

	if (!ServerManager.documents.has(fileUri))
		ServerManager.documents.set(fileUri, fileContentString);

	console.log('onFileOpened... ' + fileUri);

	await switchToOpusUiAppAndReloadCachesIfRequired(fileUri);

	if (fileIsOutsideScope(fileUri))
		return;

	const fileNodeExistsInNodesMap = ServerManager.caches.nodes.has(getAbsolutePathFromUri(fileUri));

	if (!fileNodeExistsInNodesMap) {
		const fileExistsOnMachine = await fetchFile(fileUri, true);

		if (fileExistsOnMachine)
			handlerOnFileCreated(fileUri, fileContentString);

		return;
	}

	handlerOnFileOpened(fileUri, fileContentString);
};

export default onFileOpened;
