import {
	logger,
	nodeJSBannerBranding,
} from './build-logger.js';
import {copyAssets} from './build-tasks.js';
import {getTimeItTook} from './build-functions.js';

const siteRoot = process.argv[2];
const assetFolders = process.argv[3].split(','); // e.g. fonts,data,pdf - splits to an array
const start = Date.now();

copyAssets(siteRoot, assetFolders)
	.then(() => {
		logger.banner(`Build complete in ${getTimeItTook(start)}`, nodeJSBannerBranding);
	})
	.catch(error => {
		logger.failure(error);
	});
