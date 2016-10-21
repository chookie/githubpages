/*
    From https://gist.github.com/jkarttunen/a576e8dabe3a320e224b
    and  http://charliegleason.com/articles/deploying-to-github-pages-with-gulp

    "devDependencies": {
    "babel-preset-es2015": "^6.16.0",
    "babelify": "^7.3.0",
    "browser-sync": "^2.17.5",
    "browserify": "^13.1.0",
    "child_process": "^1.0.2",
    "gulp": "^3.9.1",
    "gulp-clean": "^0.3.2",
    "gulp-gh-pages": "^0.5.4",
    "harp": "^0.21.0",
    "vinyl-source-stream": "^1.1.0"
  }

*/

var gulp = require('gulp');
var clean = require('gulp-clean');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var harp = require('harp');
var cp = require('child_process');
var source = require('vinyl-source-stream');
var browserify = require('browserify');


// Static server
gulp.task('serve', ['build'], function () {
  browserSync({
    server: "./dist",
    open: true,
    /* Hide the notification. It gets annoying */
    notify: {
      styles: ['opacity: 0', 'position: absolute']
    }
  });
  gulp.watch("public/js/**/*.js",['compile']);
  gulp.watch("public/**/*.{css,sass,scss,less,html,ejs,jade,styl,haml,json}", ['process']);
  
  gulp.watch("dist/**/*.{js,html,ejs,jade,styl,haml,json}").on('change', browserSync.reload);
  gulp.watch(["dist/**/*.{css,sass,scss,less"], [function () {
    reload("main.css", {stream: true});
  }]);
});

gulp.task('process', function (done) {
  cp.exec('harp compile ./public dist', {stdio: 'inherit'})
    .on('close', done)
    .on('error', done)
}, compile);

gulp.task('compile', function() {
	return compile();
});

var compile = function() {
	return browserify('public/js/index.js')
		.transform('babelify', {presets: ['es2015']})
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('dist/js'));
}

// gulp.task('clean', function () {
//     return gulp.src('dist', {read: false})
//         .pipe(clean());
// });

gulp.task('build',['compile'], function() {
    return gulp.src(['dist/js/**/*.js','!dist/js/*undle.js'], {read: false})
      .pipe(clean());
});

gulp.task('default', ['serve']);