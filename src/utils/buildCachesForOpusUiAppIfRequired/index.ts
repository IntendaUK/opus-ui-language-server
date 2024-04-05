// Helpers
import { getPackageJsonDataForOpusUiApp } from '../packageJsonUtils';
import { stringifyObjectWithMaps } from '../utils';
import buildAppPaths from './helpers/buildAppPaths';

// Model
import type { LanguageServerPaths } from '../../model';
import type { OpusPackageJsonData } from '../packageJsonUtils';

// Managers
import CacheManager from '../../managers/cacheManager';
import ServerManager from '../../managers/serverManager';

// Local Helpers
const checkIfOpusUiAppNeedsLoad = (existingPaths: LanguageServerPaths | null, newPaths: LanguageServerPaths): boolean => {
	if (!existingPaths)
		return true;

	const existingPathsString = stringifyObjectWithMaps(existingPaths);
	const newPathsString = stringifyObjectWithMaps(newPaths);

	return newPathsString !== existingPathsString;
};

// Implementation
const switchToOpusUiAppAndReloadCachesIfRequired = async (fileUri: string) => {
	ServerManager.queueEvents = true;

	await (async () => {
		const opusPackageJsonData: OpusPackageJsonData | null = await getPackageJsonDataForOpusUiApp(fileUri!);
		if (!opusPackageJsonData)
			return;

		const newLanguageServerPaths: LanguageServerPaths | null = await buildAppPaths(opusPackageJsonData.packageJsonPath, opusPackageJsonData.packageJsonValue);
		if (!newLanguageServerPaths)
			return;

		const previouslyCachedOpusUiAppData = ServerManager.opusUiAppMap.get(newLanguageServerPaths.opusAppPath) || null;

		const opusUiAppNeedsToBeLoaded = checkIfOpusUiAppNeedsLoad(previouslyCachedOpusUiAppData?.languageServerPaths || null, newLanguageServerPaths);

		if (!opusUiAppNeedsToBeLoaded) {
			ServerManager.paths = previouslyCachedOpusUiAppData!.languageServerPaths;
			ServerManager.caches = previouslyCachedOpusUiAppData!.caches;
		} else {
			console.log(`\n\n*******\nBUILDING CACHES FOR APP: ${newLanguageServerPaths.opusAppPath}\n*******\n\n`);

			ServerManager.paths = newLanguageServerPaths;

			const caches = new CacheManager();

			await caches.setup();

			ServerManager.caches = caches;

			ServerManager.opusUiAppMap.set(newLanguageServerPaths.opusAppPath, {
				languageServerPaths: newLanguageServerPaths,
				caches
			});

			console.log(`\n\n*******\nBUILT CACHES FOR APP: ${newLanguageServerPaths.opusAppPath}\n*******\n\n`);
		}

	})();

	ServerManager.queueEvents = false;
};

export default switchToOpusUiAppAndReloadCachesIfRequired;
