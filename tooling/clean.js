import {
	logger,
	nodeJSBannerBranding,
} from './build-logger.js';
import {clean} from './build-tasks.js';
import {getTimeItTook} from './build-functions.js';

const siteRoot = process.argv[2];
const start = Date.now();

clean(siteRoot)
	.then(() => {
		logger.banner(`Build complete in ${getTimeItTook(start)}`, nodeJSBannerBranding);
	})
	.catch(error => {
		logger.failure(error);
	});
