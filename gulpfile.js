var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var uglify = require('gulp-uglify');

var paths = {
    root: ['./www/'],
    app: ['./src/app.js'],
    index: ['./src/index.html'],
    controllers: ['./src/controllers/*.js'],
    services: ['./src/services/*.js'],
    factories: ['./src/factories/*.js'],
    css: ['./src/css/*'],
    tpl: ['./src/templates/*'],
    dist: './www/js/dist/',
    sass: ['./scss/**/*.scss']
};

gulp.task('app', function (done) {
    gulp.src(paths.app)
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist))
        .on('end', done);
});

gulp.task('index', function (done) {
    gulp.src(paths.index)
        .pipe(gulp.dest('./www/'))
        .on('end', done);
});

gulp.task('factories', function (done) {
    gulp.src(paths.factories)
        .pipe(concat('factories.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist))
        .on('end', done);
});

gulp.task('controllers', function (done) {
    gulp.src(paths.controllers)
        .pipe(concat('controllers.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist))
        .on('end', done);
});

gulp.task('services', function (done) {
    gulp.src(paths.services)
        .pipe(concat('services.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist))
        .on('end', done);
});

gulp.task('tpl', function (done) {
    gulp.src(paths.tpl)
        .pipe(gulp.dest('./www/templates/'))
        .on('end', done);
});

gulp.task('css', function (done) {
    gulp.src(paths.css)
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});

gulp.task('default', ['sass']);

gulp.task('dist', ['app', 'index', 'services', 'factories', 'controllers', 'css', 'tpl'], function () {
    gulp.watch(paths.app, ['app']);
    gulp.watch(paths.index, ['index']);
    gulp.watch(paths.services, ['services']);
    gulp.watch(paths.factories, ['factories']);
    gulp.watch(paths.controllers, ['controllers']);
    gulp.watch(paths.css, ['css']);
    gulp.watch(paths.tpl, ['tpl']);
});

gulp.task('sass', function (done) {
    gulp.src('./scss/ionic.app.scss')
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});

gulp.task('watch', ['sass'], function () {
    gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function () {
    return bower.commands.install()
        .on('log', function (data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('git-check', function (done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});
