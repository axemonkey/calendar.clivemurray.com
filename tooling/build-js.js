import {
	logger,
	jsBannerBranding,
} from './build-logger.js';
import {buildJs} from './build-tasks.js';
import {getTimeItTook} from './build-functions.js';

const siteRoot = process.argv[2];
const start = Date.now();

buildJs(siteRoot)
	.then(() => {
		logger.banner(`Build complete in ${getTimeItTook(start)}`, jsBannerBranding);
	})
	.catch(error => {
		logger.failure(error);
	});
