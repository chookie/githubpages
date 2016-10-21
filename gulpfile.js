
var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var deploy = require('gulp-gh-pages');

gulp.task('sass', function() {
    return gulp.src('./public/css/*.{css,sass,scss}')
        .pipe(sourcemaps.init())  // Process the original sources
        .pipe(sass())
        .pipe(sourcemaps.write()) // Add the map to modified source.
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream());
});

gulp.task('jshint', function() {
  return gulp.src('./public/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('jscompile', function() {
	return browserify('./public/js/index.js', {
            debug: true
        })
		.transform('babelify', {
            presets: ['es2015','react'],
            sourceMaps: true
        })
		.bundle()
		.pipe(source('bundle.js'))
        .pipe(buffer()) // sourcemaps requires buffer
        .pipe(sourcemaps.init({loadMaps: true}))  // load sources from pre-babel transpile
        //only uglify if gulp is run with '--type production'
        .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop()) 
        .pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./dist/js'));
});

gulp.task('js', ['jshint','jscompile']);

gulp.task('html', function() {
    return gulp.src(['./public/**/*.html'])
        .pipe(gulp.dest('./dist'))
})

gulp.task('build', ['sass','js','html']);

gulp.task('clean', function () {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});

// Static server
gulp.task('serve', ['build'], function() {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        open: true,
        /* Hide the notification. It gets annoying */
        notify: {
        styles: ['opacity: 0', 'position: absolute']
        }
    });
    gulp.watch('./public/css/**/*.{css,sass}', ['sass']);
    gulp.watch('./public/**/*.js',['js']);
    gulp.watch('./public/*.html',['html']);
    gulp.watch('./dist/**/*.{js,html}').on('change', reload);
});

/**
 * Push build to github-pages
 */
gulp.task('deploy', function () {
  return gulp.src("./dist/**/*")
    .pipe(deploy({
        remoteUrl: 'https://github.com/chookie/chookie.github.io.git' 
    }))
});

gulp.task('default', ['serve']);