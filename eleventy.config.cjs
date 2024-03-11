module.exports = function (eleventyConfig) {
	eleventyConfig.addPassthroughCopy('calendar.clivemurray.com/public');
	eleventyConfig.addPassthroughCopy({ 'calendar.clivemurray.com/robots.txt': '/robots.txt' });
	eleventyConfig.setUseGitIgnore(false);
	eleventyConfig.setServerOptions({
		// liveReload: false,
		watch: [
			'calendar.clivemurray.com/public/**/*',
		],
		showVersion: true,
	});

	return {
		dir: {
			includes: "_includes",
			layouts: "_layouts",
		}
	}
};
