// Utils
import { handlerOnFolderDeleted } from '../../../utils/buildNodes/nodeEventHandlerUtils';
import fileIsOutsideScope from '../../../utils/fileIsOutsideScope';

// Implementation
const onDeletedFolder = async (folderUri: string) => {
	if (fileIsOutsideScope(folderUri))
		return;

	handlerOnFolderDeleted(folderUri);
};

export default onDeletedFolder;
