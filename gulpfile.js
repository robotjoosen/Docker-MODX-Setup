const gulp = require('gulp');
const sass = require('gulp-sass');
const minify = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const livereload = require('gulp-livereload');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const shell = require('gulp-shell');
const fontello = require('gulp-fontello');
const replace = require('gulp-replace');
const argv = require('yargs').argv;
const browserify = require("browserify");
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const env = require('dotenv').config();
const exec = require('child_process').exec;
const babel = require("gulp-babel");
const globify = require('require-globify');
const babelify = require('babelify');
const stringify = require('stringify');


let theme = (argv.theme) ? argv.theme : 'default';
let path = {
	js: {
		watch: './src/themes/' + theme + '/js/**/*.js',
		src: 'src/themes/' + theme + '/js/**/*.js',
		modules: './src/themes/' + theme + '/js/modules.json',
		output: 'script.js',
		dest: 'public_html/assets/themes/' + theme + '/js'
	},
	scss: {
		watch: './src/themes/' + theme + '/scss/**/*.scss',
		src: 'src/themes/' + theme + '/scss/*.scss',
		modules: './src/themes/' + theme + '/scss/modules.json',
		output: 'style.css',
		dest: 'public_html/assets/themes/' + theme + '/css'
	},
	components: {
		watch: [
			'./public_html/core/components/**/elements/snippets/*.php',
			'./public_html/core/components/**/elements/plugins/*.php',
			'./public_html/core/components/**/elements/**/*.tpl',
			'./public_html/core/components/**/lexicon/**/*.inc.php',
			'./public_html/assets/components/**/*.php'
		]
	},
	fontello: {
		'config': './src/themes/' + theme + '/fontello/config.json',
		'destination': {
			'font': 'public_html/assets/themes/' + theme + '/font',
			'css': 'src/themes/' + theme + '/fontello/css'
		}
	}
};

/**
 * Compile SCSS to CSS
 * @return {*}
 */
function compileStyle() {
	let files = require(path.scss.modules);
	files.push(path.scss.src);
	return (
		gulp
			.src(files)
			.pipe(concat(path.scss.output))
			.pipe(sass({
				includePaths: ['node_modules']
			}))
			.on('error', sass.logError)
			.pipe(autoprefixer())
			.pipe(gulp.dest(path.scss.dest))
			.pipe(minify({compatibility: 'ie11'}))
			.pipe(rename({suffix: '.min'}))
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(path.scss.dest))
			.pipe(livereload())
	);
}

/**
 * Compile Javascript (ES6 to ES5)
 * @return {*}
 */
function compileJavascript() {
	try {
		return (
			browserify({
				entries: './src/themes/' + theme + '/js/init.js',
				debug: true,
				transform: [babelify, globify, stringify]
			})
				.bundle()
				.pipe(source(path.js.output))
				.pipe(gulp.dest(path.js.dest))
				.pipe(buffer())
				.pipe(sourcemaps.init())
				.pipe(uglify({
					compress: {
						drop_console: (env.parsed.DEBUG !== '1')
					}
				}))
				.pipe(rename({suffix: '.min'}))
				.pipe(sourcemaps.write('./maps'))
				.pipe(gulp.dest(path.js.dest))
				.pipe(livereload())
		);
	} catch (e) {
		console.warn(e);
	}
}

/**
 * Watch build files
 */
function watchFiles() {
	console.log({
		'theme': theme,
		'scss': path.scss.watch,
		'js': path.js.watch,
		'components': path.components.watch,
		'env': env.parsed
	});
	gulp.watch(path.scss.watch, compileStyle);
	gulp.watch(path.js.watch, compileJavascript);
	gulp.watch(path.components.watch, clearCache);
	livereload.listen();
}

function getIcons() {
	return (
		gulp.src(path.fontello.config)
			.pipe(fontello({
				font: path.fontello.destination.font,
				css: path.fontello.destination.css,
			}))
			.pipe(replace('../public_html/assets/themes/' + theme + '/font/fontello', '../font/fontello'))
			.pipe(gulp.dest('./'))
	);
}

/**
 * Clear MODX cache with the gulp cache controller
 * @return {*}
 */
function clearCache() {
	try {
		if (env.parsed.ENVIRONMENT === 'development') {
			console.log('Docker Clear Cache');
			return (gulp
					.src('gulpfile.js', {read: false})
					.pipe(shell('docker exec pickup-configurator-nl-php-fpm php /application/src/controller/GulpCacheController.php'))
					.pipe(livereload())
			);
		} else {
			console.log('Server Clear Cache');
			return (gulp
					.src('gulpfile.js', {read: false})
					.pipe(shell('php ./src/controller/GulpCacheController.php > /dev/null 2>/dev/null &'))
					.pipe(livereload())
			);
		}
	} catch (e) {
		console.warn(e);
	}
}

/**
 * Do a MySQL from the database
 * @param done
 */
function backupDatabase(done) {
	try {
		const date = new Date();
		const filename = date.toISOString().replace(/[:.]/g, '') + ".sql";
		let mysqldmp = "docker exec pickup-configurator-nl-mysql /usr/bin/mysqldump -u root -pmysql local_pickupconfigurator > _backup/" + filename;
		exec(mysqldmp, function (err, stdout, stderr) {
			console.log(err);
			console.log(stderr);
			console.log(stdout);
		});
		done();
	} catch (e) {
		console.warn(e);
	}
}

/**
 * Extract data from MODX with Gitify
 * @param done
 */
function gitifyExtract(done) {
	try {
		const extract = "docker exec -w /application/public_html pickup-configurator-nl-php-fpm /opt/Gitify/Gitify extract";
		exec(extract, function (err, stdout, stderr) {
			console.log(err);
			console.log(stderr);
			console.log(stdout);
		});
		done();
	} catch (e) {
		console.warn(e);
	}
}

const watch = gulp.parallel(watchFiles);
const build = gulp.parallel(compileStyle, compileJavascript);
const js = gulp.parallel(compileJavascript);
const style = gulp.parallel(compileStyle);
const fullbackup = gulp.parallel(backupDatabase, gitifyExtract);

exports.refresh = clearCache;
exports.icons = getIcons;
exports.style = style;
exports.js = js;
exports.build = build;
exports.default = watch;
exports.backup = fullbackup;
