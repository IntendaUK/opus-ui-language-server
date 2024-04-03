// Utils
import { handlerOnFileDeleted } from '../../../utils/buildNodes/nodeEventHandlerUtils';
import fileIsOutsideScope from '../../../utils/fileIsOutsideScope';

// Implementation
const onDeletedFile = async (fileUri: string) => {
	if (fileIsOutsideScope(fileUri))
		return;

	handlerOnFileDeleted(fileUri);
};

export default onDeletedFile;
