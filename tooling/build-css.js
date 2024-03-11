import {
	logger,
	sassBannerBranding,
} from './build-logger.js';
import {buildCss} from './build-tasks.js';
import {getTimeItTook} from './build-functions.js';

const siteRoot = process.argv[2];
const start = Date.now();

buildCss(siteRoot)
	.then(() => {
		logger.banner(`Build complete in ${getTimeItTook(start)}`, sassBannerBranding);
	})
	.catch(error => {
		logger.failure(error);
	});
