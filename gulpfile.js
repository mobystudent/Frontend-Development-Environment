'use strict';

const gulp = require('gulp'),
	del = require('del'),
	pug = require('gulp-pug'),
	sourcemaps = require('gulp-sourcemaps'),
	rename = require('gulp-rename'),
	browserSync = require('browser-sync').create();

/* styles */
const autoprefixer = require('gulp-autoprefixer'),
	sass = require('gulp-sass'),
	groupcmq = require('gulp-group-css-media-queries'),
	cleanCSS = require('gulp-clean-css');

/* images */
const imagemin = require('gulp-imagemin'),
	jp2000 = require('gulp-jpeg-2000'),
	webp = require('gulp-webp');

/* fonts */
const ttf2svg = require('gulp-ttf-svg'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2'),
	ttf2eot = require('gulp-ttf2eot');

/* scripts */
const rollup = require('gulp-better-rollup'),
	commonjs = require('@rollup/plugin-commonjs'),
	babel = require('rollup-plugin-babel'),
	nodeResolve = require('rollup-plugin-node-resolve'),
	minify = require('gulp-minify');

/* settings */
const dirBuild = 'build',
	dirSrc = 'src',
	path = {
		build: {
			html: dirBuild,
			css: dirBuild,
			pug: dirSrc + '/template',
			fonts: dirBuild + '/fonts',
			favicon: dirBuild + '/favicon',
			img: dirBuild + '/img',
			js: dirBuild + '/js'
		},
		src: {
			html: dirSrc + '/template/*.html',
			css: dirSrc + '/css/style.scss',
			pug: dirSrc + '/pug/**/*.pug',
			fonts: dirSrc + '/fonts/*.{ttf,otf}',
			favicon: dirSrc + '/favicon/*',
			img: dirSrc + '/img/**/*',
			imgPic: dirSrc + '/img/*.{jpg,jpeg,png}',
			js: dirSrc + '/js/script.js'
		},
		watch: {
			html: dirSrc + '/template/**/*.html',
			css: dirSrc + '/css/**/*.scss',
			pug: dirSrc + '/pug/**/*.pug',
			favicon: dirSrc + '/favicon/*',
			img: dirSrc + '/img/**/*',
			js: dirSrc + '/js/**/*.js'
		}
	};

/* clear build dir */
function clean() {
	return del(dirBuild + '/**');
}

/* conversion sass */
function gulpSass() {
	return gulp.src(path.src.css)
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'compressed'
		})
		.on('error', sass.logError))
		.pipe(groupcmq())
		.pipe(autoprefixer({
			grid: true,
			overrideBrowserslist: ['> 0.4%, last 4 versions, firefox >= 52, edge >= 16, ie >= 11, safari >=10']
		}))
		.pipe(gulp.dest(path.build.css))
		.pipe(cleanCSS())
		.pipe(rename('style.min.css'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(path.build.css));
}

/* conversion fonts */
function gulpFonts() {
	return gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts))
		.pipe(ttf2svg())
		.pipe(gulp.src(path.src.fonts))
		.pipe(ttf2woff())
		.pipe(gulp.src(path.src.fonts))
		.pipe(ttf2woff2())
		.pipe(gulp.src(path.src.fonts))
		.pipe(ttf2eot())
		.pipe(gulp.dest(path.build.fonts));
}

/* conversion pug */
function gulpPug() {
	return gulp.src(path.src.pug)
		.pipe(pug({
			pretty: true
		}))
		.pipe(gulp.dest(path.build.pug));
}

/* copy html in build dir */
function gulpHTML() {
	return gulp.src(path.src.html)
		.pipe(gulp.dest(path.build.html));
}

/* optimize images */
function gulpImages() {
	return gulp.src(path.src.imgPic)
		.pipe(jp2000())
		.pipe(gulp.src(path.src.imgPic))
		.pipe(webp({
			quality: 70
		}))
		.pipe(gulp.src(path.src.img))
		.pipe(imagemin([
			imagemin.mozjpeg({quality: 90, progressive: true}),
			imagemin.optipng()
		]))
		.pipe(gulp.dest(path.build.img));
}

/* copy favicon in build dir */
function gulpFavicon() {
	return gulp.src(path.src.favicon)
		.pipe(gulp.dest(path.build.favicon));
}

/* conversion js bundle */
function gulpJS() {
	return gulp.src(path.src.js)
		.pipe(sourcemaps.init())
		.pipe(rollup({
			plugins: [
				nodeResolve(),
				commonjs(),
				babel({
					presets: [
						"@babel/env"
					]
				})
			]
		}, {
			format: 'umd'
		}))
		.pipe(minify({
			ext: {
				min: '.min.js'
			}
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(path.build.js));
}

/* watch src files and show changes in browser */
function gulpWatch() {
	browserSync.init({
		server: './'+dirBuild
	});

	gulp.watch(path.watch.css, gulp.series(gulpSass));
	gulp.watch(path.watch.pug, gulp.series(gulpPug));
	gulp.watch(path.watch.html, gulp.series(gulpHTML));
	gulp.watch(path.watch.js, gulp.series(gulpJS));
}

const dev = gulp.series(clean, gulp.parallel(gulp.series(gulpImages, gulpFonts, gulpSass), gulpHTML, gulpPug, gulpJS, gulpFavicon)),
	build = gulp.series(clean, gulp.parallel(gulp.series(gulpImages, gulpFonts, gulpSass), gulpHTML, gulpJS, gulpFavicon));

exports.srcault = build;
exports.watch = gulp.series(build, gulpWatch);
exports.dev = gulp.series(dev, gulpWatch);
exports.elem = gulp.series(gulp.parallel(gulpFonts, gulpFavicon, gulpImages));
exports.clean = clean;
exports.js = gulpJS;
exports.img = gulpImages;
exports.fonts = gulpFonts;
