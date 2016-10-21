/*
    From https://gist.github.com/jkarttunen/a576e8dabe3a320e224b
    and  http://charliegleason.com/articles/deploying-to-github-pages-with-gulp
*/

var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var harp = require('harp');
var cp = require('child_process');
var source = require('vinyl-source-stream');
var browserify = require('browserify');

/**
 * Serve the Harp Site from the src directory
 */
gulp.task('serve', function () {
  harp.server(__dirname + "/public", {
    port: 9000
  }, function () {
    browserSync({
      proxy: "localhost:9000",
      open: true,
      /* Hide the notification. It gets annoying */
      notify: {
        styles: ['opacity: 0', 'position: absolute']
      }
    });
    /* compile if javascript changed */
    gulp.watch(["public/js/index.js"],['compile']);
    /**
     * Watch for scss changes, tell BrowserSync to refresh main.css
     */
    gulp.watch(["public/**/*.{css,sass,scss,less"], function () {
      reload("main.css", {stream: true});
    });
     /**
     * Watch for javascript changes, tell BrowserSync to refresh script.js
     */
    gulp.watch("public/js/bundle.js", function () {
      reload("bundle.js", {stream: true});
    });
    /**
     * Watch for all other changes, reload the whole page
     */
    gulp.watch(["public/**/*.{html,ejs,jade,styl,haml,json,md}"], function () {
      reload();
    });
  })
});

gulp.task('build', ['compile'], function (done) {
  cp.exec('harp compile ./public dist', {stdio: 'inherit'})
    .on('close', done)
    .on('error', done)
});

gulp.task('compile', function() {
	return browserify('public/js/index.js')
		.transform('babelify', {presets: ['es2015']})
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('public/js'));
});

/**
 * Default task, running `gulp` will fire up the Harp site,
 * launch BrowserSync & watch files.
 */
gulp.task('default', ['serve']);