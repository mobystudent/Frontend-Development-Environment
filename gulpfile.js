'use strict';

const gulp = require('gulp'),
	del = require('del'),
	pug = require('gulp-pug'),
	imagemin = require('gulp-imagemin'),
	sass = require('gulp-sass'),
	groupcmq = require('gulp-group-css-media-queries'),
	sourcemaps = require('gulp-sourcemaps'),
	autoprefixer = require('gulp-autoprefixer'),
	browserSync = require('browser-sync').create();

const path = {
		build: {
			html: dirBuild,
			css: dirBuild,
			fonts: dirBuild + '/fonts',
			animation: dirBuild + '/animation',
			favicon: dirBuild + '/favicon',
			img: dirBuild + '/img',
			js: dirBuild + '/js'
		},
		src: {
			html: dirSrc + '/template/*.html',
			css: dirSrc + '/css/style.scss',
			fonts: dirSrc + '/fonts/**/*',
			animation: dirSrc + '/animation/*',
			favicon: dirSrc + '/favicon/*',
			img: dirSrc + '/img/**/*',
			js: dirSrc + '/js/script.js'
		},
		watch: {
			html: dirSrc + '/template/**/*.html',
			css: dirSrc + '/css/**/*.scss',
			fonts: dirSrc + '/fonts/**/*',
			animation: dirSrc + '/animation/*',
			favicon: dirSrc + '/favicon/*',
			img: dirSrc + '/img/**/*',
			js: dirSrc + '/js/**/*.js'
		}
	};

function clean() {
	return del(dirBuild + '/**');
}

function gulpSass() {
	return gulp.src(path.src.css)
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'compressed'
		})
		.on('error', sass.logError))
		.pipe(groupcmq())
		.pipe(autoprefixer({
			overrideBrowserslist: ['> 0.4%, last 4 versions, firefox >= 52, edge >= 16, ie >= 11, safari >=10']
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(path.build.css));
}

function gulpFonts() {
	return gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts));
}

function gulpHTML() {
	return gulp.src(path.src.html)
		.pipe(gulp.dest(path.build.html));
}

function gulpImages() {
	return gulp.src(path.src.img)
		.pipe(imagemin([
			imagemin.mozjpeg({quality: 90, progressive: true}),
			imagemin.optipng(),
			imagemin.svgo()
		]))
		.pipe(gulp.dest(path.build.img));
}

function gulpFavicon() {
	return gulp.src(path.src.favicon)
		.pipe(gulp.dest(path.build.favicon));
}

function gulpWatch() {
	browserSync.init({
		server: './'+dirBuild
	});

	gulp.watch(path.watch.css, gulp.series(gulpSass));
	gulp.watch(path.watch.fonts, gulp.series(gulpFonts));
	gulp.watch(path.watch.pug, gulp.series(gulpPug));
	gulp.watch(path.watch.html, gulp.series(gulpHTML));
	gulp.watch(path.watch.img, gulp.series(gulpImages));
	gulp.watch(path.watch.favicon, gulp.series(gulpFavicon));
	gulp.watch(path.watch.js, gulp.series(gulpJs));
}

const dev = gulp.series(clean, gulp.parallel(gulpSass, gulpHTML, gulpPug, gulpJS, gulpFonts, gulpFavicon, gulpImages)),
	build = gulp.series(clean, gulp.parallel(gulpSass, gulpHTML, gulpJS, gulpFonts, gulpFavicon, gulpImages));

exports.default = build;
exports.watch = gulp.series(build, gulpWatch);
exports.dev = gulp.series(dev, gulpWatch);
exports.clean = clean;
exports.js = gulpJS;
exports.img = gulpImages;
exports.fonts = gulpFonts;
