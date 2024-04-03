/*
// Model
import type { DidChangeConfigurationParams } from 'vscode-languageserver';

// Managers
import ServerManager from '../index';

// Local Internals
export const UNSET_ENSEMBLES_FOLDER = '{ENSEMBLES_FOLDER_NOT_SET}';

// Local Model
type LanguageServerUserConfiguration = {

}

export let SERVER_CONFIG_PARAMS: LanguageServerUserConfiguration = null!;

// Internal Utils
const onSettingsConfigurationChanged = async (configurationParams: DidChangeConfigurationParams) => {
	try {
		console.log('onSettingsConfigurationChanged...');

		const configurationSettings: LanguageServerUserConfiguration = configurationParams.settings.opusLanguageServer;

		SERVER_CONFIG_PARAMS = configurationSettings;

		const languageServerIsSetup = !!ServerManager.paths;
		if (languageServerIsSetup)
			// Do something when the server is ready.

	} catch (e: any) {
		console.log(e.message);
	}
};

export default onSettingsConfigurationChanged;
*/
