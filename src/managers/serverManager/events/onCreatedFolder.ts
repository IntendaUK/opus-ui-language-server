// Utils
import { handlerOnFolderCreated } from '../../../utils/buildNodes/nodeEventHandlerUtils';
import fileIsOutsideScope from '../../../utils/fileIsOutsideScope';

// Implementation
const onCreatedFolder = async (folderUri: string) => {
	if (fileIsOutsideScope(folderUri))
		return;

	handlerOnFolderCreated(folderUri);
};

export default onCreatedFolder;
