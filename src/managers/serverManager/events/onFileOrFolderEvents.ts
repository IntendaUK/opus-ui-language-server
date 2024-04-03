// Plugins
import { FileChangeType } from 'vscode-languageserver';

// Model
import type { DidChangeWatchedFilesParams, FileEvent } from 'vscode-languageserver';
import onCreatedFolder from './onCreatedFolder';

// Utils
import onDeletedFile from './onDeletedFile';
import onCreatedFile from './onCreatedFile';
import onDeletedFolder from './onDeletedFolder';

// Implementation
const onFolderEvent = (folderEvent: FileEvent) => {
	const { uri, type: fileChangeEventType } = folderEvent;

	if (fileChangeEventType === FileChangeType.Created) {
		onCreatedFolder(uri);
		return;
	}

	if (fileChangeEventType === FileChangeType.Deleted) {
		onDeletedFolder(uri);
		return;
	}
};

const onFileEvent = (fileEvent: FileEvent) => {
	const { uri, type: fileChangeEventType } = fileEvent;

	if (uri.split('.')[1] !== 'json' || uri.lastIndexOf('mdaPackage.json') > -1)
		return;

	if (fileChangeEventType === FileChangeType.Created) {
		onCreatedFile(uri);
		return;
	}

	if (fileChangeEventType === FileChangeType.Deleted) {
		onDeletedFile(uri);
		return;
	}
};

/*
	This caters for file operations such as Create, Rename and Delete.
	...Although there is no explicit hook for rename, we get sent two events...
	...one for removing and another for creating.
*/

const onFileOrFolderEvents = async ({ changes: fileEventChanges }: DidChangeWatchedFilesParams) => {
	fileEventChanges.forEach(fileEventChange => {
		const split = fileEventChange.uri.split('.');

		const isFolder = split.length === 1;

		if (isFolder)
			onFolderEvent(fileEventChange);
		else
			onFileEvent(fileEventChange);
	});
};

export default onFileOrFolderEvents;
