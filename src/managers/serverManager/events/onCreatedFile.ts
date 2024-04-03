// Utils
import fetchFile from '../../../utils/fetchFile';
import fileIsOutsideScope from '../../../utils/fileIsOutsideScope';
import { getAbsolutePathFromUri } from '../../../utils/pathUtils';
import { handlerOnFileCreated } from '../../../utils/buildNodes/nodeEventHandlerUtils';

// Managers
import ServerManager from '../index';

/*
	Note: When creating a file in the editor, the client will call onFileOpened first
	...before it calls this, so in that situation the file will be created in there. And we will return.
	However, onCreatedFile is still necessary for situations where new files are created but not opened automatically by the client.
	...e.g. manually moving/copying files from one folder to another, locally or externally.
 */

// Implementation
const onCreatedFile = async (fileUri: string) => {
	const fileContentString = (await fetchFile(fileUri, true))!;

	ServerManager.documents.set(fileUri, fileContentString);

	if (fileIsOutsideScope(fileUri))
		return;

	const fileNodeExistsInNodesMap = ServerManager.caches.nodes.has(getAbsolutePathFromUri(fileUri));
	if (fileNodeExistsInNodesMap)
		return;

	handlerOnFileCreated(fileUri, fileContentString);
};

export default onCreatedFile;
