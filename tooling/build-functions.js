import fs from 'fs';
import path from 'path';
import sass from 'sass';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import {optimize} from 'svgo';
import sharp from 'sharp';
import {svgoOptions} from './svgo-config.js';

import {
	logger,
	em,
	sassBannerBranding,
	jsBannerBranding,
	imagesBannerBranding,
	dangerBannerBranding,
	nodeJSBannerBranding,
} from './build-logger.js';

/**
 * Gets the time it took from given start date.
 *
 * @param {Object} start - Reference Start date.
 */
function getTimeItTook(start) {
	const stop = Date.now();
	return `${em(`${(stop - start) / 1000}s`)}`;
}

async function processImagesFunction(options) {
	logger.banner('Processing images', imagesBannerBranding);
	const start = Date.now();

	async function processSvg(svgFile) {
		logger.info(`doing a SVG innit`);
		logger.warning(`typeof svgoOptions: ${typeof svgoOptions}`);

		const filePath = `${options.source}/${svgFile}`;
		const destinationFile = `${options.destination}/${svgFile}`;
		const svgFileContent = fs.readFileSync(filePath, 'utf8');

		// const result = optimize(svgFileContent, svgProcessOptions);
		const result = optimize(svgFileContent);
		const optimizedSvgFileContent = result.data;

		logger.step(`SVG from ${em(path.basename(filePath))} optimised with SVGO`);
		fs.writeFileSync(destinationFile, optimizedSvgFileContent);
		// logger.step(`SVG saved to ${em(destinationFile)}`);

		logger.step(`${em(destinationFile)} successfully created\n`);
	}

	async function processImage(imageFile) {
		const filePath = `${options.source}/${imageFile}`;
		const destinationFile = `${options.destination}/${imageFile}`;

		await sharp(filePath)
			.toFile(destinationFile)
			.then(() => {
				logger.step(`Image ${em(destinationFile)} optimised with Sharp`);

				logger.step(`${em(destinationFile)} successfully created\n`);
			})
			.catch(error => {
				logger.warning(error);
			});
	}

	if (fs.existsSync(options.source)) {
		const imageFiles = fs
			.readdirSync(options.source)
			.filter(file => {
				const supportedExtensions = ['png', 'jpg', 'jpeg', 'svg', 'ico', 'gif', 'avif', 'webp'];
				for (const extension of supportedExtensions) {
					if (path.extname(file).toLowerCase() === `.${extension}`) {
						return true;
					}
				}

				if (fs.statSync(`${options.source}/${file}`).isDirectory()) {
					logger.info(`${file} is a directory`);
					processImagesFunction({
						source: `${options.source}/${file}`,
						destination: `${options.destination}/${file}`,
					});
				}
				return false;
			});

		logger.info(`Found ${imageFiles.length} image(s) to process\n`);

		if (imageFiles.length > 0) {
			// make images folder
			fs.mkdirSync(options.destination, {recursive: true});

			for (const imageFile of imageFiles) {
				const filePath = `${options.source}/${imageFile}`;
				const fileExtension = path.extname(imageFile).toLowerCase();

				if (['.ico'].includes(fileExtension)) {
					// just copy it
					if (fs.statSync(filePath).isFile()) {
						const destinationFile = `${options.destination}/${imageFile}`;
						fs.copyFileSync(filePath, destinationFile);

						logger.step(`${em(destinationFile)} successfully created\n`);
					}
				} else if (fileExtension === '.svg') {
					// do svgo
					await processSvg(imageFile);
				} else if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'].includes(fileExtension)) {
					// do sharp
					await processImage(imageFile);
				}
			}
		}
	}
	logger.success(`Image processing task completed in ${getTimeItTook(start)}`);
}

/**
 * Compiles SASS files in accordance to given options.
 *
 * @param {Object} options - Compiling options.
 * @param {string} options.source - Source directory containing SASS files.
 * @param {string} options.destination - Destination directory to compile the file to.
 * @param {Object} options.sassOptions - Valid Sass options object as by Dart Sass documentation.
 * @param {boolean} [options.sourceMap=false] - If `true` Sass will generate source maps.
 * @param {boolean} [options.autoprefixer=false] - If `true` it will autoprefix CSS props according to existing .browserslistrc file or browserlist prop in package.json.
 */
async function compileSassFiles(options) {
	logger.banner('Compiling SASS files to CSS', sassBannerBranding);
	const start = Date.now();

	// Compiles an individual Sass file.
	async function compileSassFile(file, outputFilename, options) {
		const mapFilename = `${outputFilename}.map`;
		const destinationFile = `${options.destination}/${outputFilename}`;

		const sassOptions = {
			file,
			outFile: `${options.destination}/${outputFilename}`,
			sourceMap: options.sourceMap || false,
			includePaths: [],
			outputStyle: 'expanded',
			// Hopefully in a near future (if this issue gets solved https://github.com/sass/sass/issues/2979),
			// we should be able to plug our logger to spit @warn and @debug in the console output as we do for other tasks.
		};

		if (options.sassOptions) {
			sassOptions.includePaths = options.sassOptions.includePaths;
			sassOptions.outputStyle = options.sassOptions.outputStyle;
		}

		const result = sass.renderSync(sassOptions);

		fs.mkdirSync(options.destination, {recursive: true});

		fs.writeFileSync(destinationFile, result.css);
		logger.step(`File has been compiled to CSS`);

		if (options.autoprefixer) {
			// PostCSS library eventually have unhandledRejection, for instance
			// when browserlist is incorrect.
			// process.on('unhandledRejection', function (error) {
			// 	throw error;
			// });

			const fd = fs.openSync(`${destinationFile}`, 'w+');

			const postCSSOptions = {
				from: file,
				to: destinationFile,
			};

			if (options.sourceMap) {
				postCSSOptions.map = {
					prev: result.map.toString(),
					inline: false,
				};
			}

			const postCSS = await postcss([autoprefixer]).process(result.css, postCSSOptions);

			for (const warn of postCSS.warnings()) {
				logger.warning(warn.toString());
			}

			fs.writeSync(fd, postCSS.css, 0, postCSS.css.length, 0);
			fs.closeSync(fd, function (error) {
				if (error) {
					throw error;
				}
			});
			logger.step(`CSS file has been autoprefixed`);
		}

		if (options.sourceMap) {
			fs.writeFileSync(`${options.destination}/${mapFilename}`, result.map);
			logger.step(`Source map has been generated`);
		}
	}

	// Compiles Sass files from the given source directory.
	if (fs.existsSync(options.source)) {
		const sassFiles = fs
			.readdirSync(options.source)
			.filter(file => {
				if (path.extname(file).toLowerCase() === '.scss' && file.charAt(0) !== '_') {
					return true;
				}
				return false;
			});

		logger.info(`Found ${sassFiles.length} SASS file(s) to compile\n`);

		for (const file of sassFiles) {
			const outputFilename = `${path.basename(file, '.scss')}.css`;
			const destinationFile = `${options.destination}/${outputFilename}`;
			logger.info(`Compiling ${em(`${options.source}/${file}`)} to ${em(options.destination)}...`);
			await compileSassFile(`${options.source}/${file}`, outputFilename, options);
			logger.info('After  compileAsset');

			logger.success(`${em(destinationFile)} successfully created in ${getTimeItTook(start)}\n`);
		}
	}
}

/**
 * Concatenates vendor Javascript
 *
 * @param {Object} optionsObj - source and destination folders
 */
async function vendorJs(optionsObj) {
	logger.banner('Concatenating vendor Javascript', jsBannerBranding);
	const start = Date.now();
	const destFile = `${optionsObj.destination}/vendor.js`;

	if (fs.existsSync(destFile)) {
		fs.unlinkSync(destFile);
	}

	if (fs.existsSync(`${optionsObj.source}/vendor`)) {
		const vendorFiles = fs
			.readdirSync(`${optionsObj.source}/vendor`)
			.filter(file => {
				if (path.extname(file).toLowerCase() === '.js') {
					// logger.info(`Adding ${file} to bundle list\n`);
					return true;
				}
				return false;
			});

		const vendorFilesLength = vendorFiles.length;
		logger.info(`Found ${vendorFilesLength} JS file(s) to concatenate\n`);

		if (vendorFilesLength > 0) {
			for (const file of vendorFiles) {
				const srcFile = `${optionsObj.source}/vendor/${file}`;
				if (fs.lstatSync(srcFile).isFile()) {
					fs.appendFileSync(destFile, fs.readFileSync(srcFile).toString());
					fs.appendFileSync(destFile, '\n\n\n');
				}
			}
		} else {
			logger.info(`No vendor files found\n`);
		}
	} else {
		logger.info(`No vendor files found\n`);
	}

	logger.success(`Vendor JS task completed in ${getTimeItTook(start)}`);
}

// Deletes path and its content if applicable (recursively).
function deletePath(pathToDelete) {
	const stats = fs.statSync(pathToDelete);

	if (stats.isFile()) {
		// logger.warning(`would have deleted file ${pathToDelete}`);
		fs.unlinkSync(pathToDelete);
	} else if (stats.isDirectory()) {
		const fsObjects = fs.readdirSync(pathToDelete);

		for (const fsObject of fsObjects) {
			const fsObjectPath = path.join(pathToDelete, fsObject);
			deletePath(fsObjectPath);
		}
		// logger.warning(`would have deleted folder ${pathToDelete}`);
		fs.rmdirSync(pathToDelete);
	}
}

/**
 * Deletes given paths.
 *
 * @param {string[]} pathsToDelete - Paths to be deleted.
 */
async function deletePaths(pathsToDelete) {
	logger.banner('Cleaning ...', dangerBannerBranding);
	const start = Date.now();

	for (const pathToDelete of pathsToDelete) {
		if (fs.existsSync(pathToDelete)) {
			deletePath(pathToDelete);
			logger.step(`${em(pathToDelete)} has been removed`);
		} else {
			logger.step(`${em(pathToDelete)} does not exist`);
		}
	}
	logger.success(`Cleaning done in ${getTimeItTook(start)}`);
}

/**
 * Copies directory from its source to its destination (recursively).
 *
 * @param {string} source - Source directory.
 * @param {string} destination - Destination directory.
 */
function copyDirectory(source, destination) {
	fs.mkdirSync(destination, {recursive: true});
	const fsObjects = fs.readdirSync(source, {withFileTypes: true});

	for (const fsObject of fsObjects) {
		const sourcePath = path.join(source, fsObject.name);
		const destinationPath = path.join(destination, fsObject.name);

		if (fsObject.isDirectory()) {
			copyDirectory(sourcePath, destinationPath);
		} else {
			fs.copyFileSync(sourcePath, destinationPath);
		}
	}
}

/**
 * Copies assets from their source to a destination.
 *
 * @param {Object[]} assets - Path entries.
 * @param {string} assets[].source - Source assets.
 * @param {string} assets[].destination - Destination path for the copy of the asset.
 */
async function copyAssetsFunction(assets) {
	logger.banner('Copying assets...', nodeJSBannerBranding);
	const start = Date.now();

	for (const asset of assets) {
		const {
			source,
			destination,
		} = asset;

		if (fs.statSync(source).isFile()) {
			fs.copyFileSync(source, destination);
			logger.step(`${em(source)} file has been copied to ${em(destination)}`);
		} else if (fs.statSync(source).isDirectory()) {
			copyDirectory(source, destination);
			logger.step(`${em(source)} directory has been copied to ${em(destination)}`);
		}
	}
	logger.success(`All assets have been copied in ${getTimeItTook(start)}`);
}

/**
 * Copies Javascript including modules for module-supporting browsers
 *
 * @param {Object} optionsObj - source and destination folders
 */
async function copyJs(optionsObj) {
	logger.banner('Copying modular Javascript', jsBannerBranding);
	const start = Date.now();

	copyDirectory(`${optionsObj.source}/js`, optionsObj.destination);
	logger.success(`Copy JS task completed in ${getTimeItTook(start)}`);
}

export {
	compileSassFiles,
	copyJs,
	vendorJs,
	copyAssetsFunction,
	processImagesFunction,
	deletePaths,
	getTimeItTook,
};
