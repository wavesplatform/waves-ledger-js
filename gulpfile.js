var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var babelify = require('babelify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');

gulp.task('build_babel_test', function () {
    return browserify({entries: './ledgerTest/index.js', extensions: ['.js'], debug: true})
        .transform(babelify, {presets: ['@babel/preset-env'], plugins: ['@babel/transform-runtime'], sourceMaps:true})
        .bundle()
        .pipe(source('ledgerTest.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', function () {
    return browserify({entries: './src/WavesLedger.js', extensions: ['.js'], debug: false})
        .transform(babelify, {presets: ['@babel/preset-env'], sourceMaps:false})
        .bundle()
        .pipe(source('WavesLedger.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('lib'));
});

gulp.task('watch', ['build_babel'], function () {
    gulp.watch('./**/*.js', ['build_babel']);
});

gulp.task('default', ['watch']);
