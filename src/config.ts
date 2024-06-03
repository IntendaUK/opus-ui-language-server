// Config
export const isDebugMode = false;
export const debugDelayStartDuration = 4000;

export const opusUiEngineDependencyFolderPath = '@intenda'; // This is relative from the app's node_modules folder and will use opusUiEngineDependencyName to find the opus-ui engine path. e.g. node_modules/@intenda/opus-ui
export const opusUiEngineDependencyName = 'opus-ui';
export const opusUiLspConfigFileName = 'lspconfig.json';
export const opusUiComponentConfigFileName = 'system.json';
export const opusUiConfigFileName = '.opusUiConfig';
export const opusUiConfigKeys = [
	'opusPackagerConfig',
	'opusUiComponentLibraries',
	'opusUiEnsembles'
];

