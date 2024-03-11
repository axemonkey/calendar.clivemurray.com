import {assetsRoot} from './project-settings.js';
import {
	bundleBrowserJS,
	copyJs,
	vendorJs,
	copyAssetsFunction,
	compileSassFiles,
	processImagesFunction,
	deletePaths,
} from './build-functions.js';

async function clean(siteRoot) {
	const pathsToDelete = [
		`${siteRoot}/${assetsRoot}`,
	];

	await deletePaths(pathsToDelete);
}

async function buildCss(siteRoot) {
	const options = {
		source: `${siteRoot}/assets/styles`,
		destination: `${siteRoot}/${assetsRoot}/css`,
		sassOptions: {
			outputStyle: 'compressed',
			includePaths: [
				'node_modules',
			],
		},
		sourceMap: false,
		autoprefixer: true, // Make sure to have a .browserslistrc file or a browserlist property in your package.json.
	};

	await compileSassFiles(options);
}

async function buildJs(siteRoot) {
	const options = {
		source: `${siteRoot}/assets`,
		destination: `${siteRoot}/${assetsRoot}/js`,
	};

	await bundleBrowserJS(options);
	await copyJs(options);
	await vendorJs(options);
}

async function copyAssets(siteRoot, assetFolders) {
	const assets = [];

	for (const folder of assetFolders) {
		assets.push({
			source: `${siteRoot}/assets/${folder}`,
			destination: `${siteRoot}/${assetsRoot}/${folder}`,
		});
	}

	await copyAssetsFunction(assets);
}

async function processImages(siteRoot) {
	const options = {
		source: `${siteRoot}/assets/images`,
		destination: `${siteRoot}/${assetsRoot}/images`,
	};

	await processImagesFunction(options);
}

export {
	clean,
	buildCss,
	buildJs,
	copyAssets,
	processImages,
};
