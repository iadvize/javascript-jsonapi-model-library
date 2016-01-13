var path = require('path');
var replace = require('gulp-replace');
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var excludeGitignore = require('gulp-exclude-gitignore');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var nsp = require('gulp-nsp');
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var del = require('del');
var isparta = require('isparta');

// Initialize the babel transpiler so ES2015 files gets compiled
// when they're loaded
require('babel-core/register');

gulp.task('static', function () {
  return gulp.src(['**/*.js', '!gulpfile.js'])
  .pipe(excludeGitignore())
  .pipe(eslint({
    rules: {
      "no-unused-vars": [2, {"varsIgnorePattern": "bootstrap"}]
    }
  }))
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
});

gulp.task('nsp', function (cb) {
  nsp({package: path.resolve('package.json'), stopOnError: false}, cb);
});

gulp.task('pre-test', function () {
    return gulp.src('lib/**/*.js')
    .pipe(excludeGitignore())
    .pipe(istanbul({
      instrumenter: isparta.Instrumenter
    }))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function (cb) {
  var mochaErr;

  gulp.src(['test/**/*.js', '!boostrap.test.js'])
  .pipe(plumber())
  .pipe(mocha({
    require: ['./test/bootstrap.test.js'],
    reporter: 'spec'
  }))
  .on('error', function (err) {
    mochaErr = err;
  })
  .pipe(istanbul.writeReports())
  .on('end', function () {
    cb(mochaErr);
  });
});

gulp.task('watch', function () {
  gulp.watch(['lib/**/*.js', 'test/**'], ['test']);
});

gulp.task('babel', ['clean'], function () {
  return gulp.src('lib/**/*.js')
  .pipe(babel())
  .pipe(gulp.dest('dist'));
});

gulp.task('json', ['clean'], function () {
  return gulp.src(['lib/**/*.json', 'lib/**/*.yml'])
  .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
  return del('dist');
});

gulp.task('copy-swagger', ['nsp', 'babel', 'json'], function () {
  return gulp.src('node_modules/swagger-ui/dist/**/*', {base: 'node_modules/swagger-ui/dist'})
  .pipe(gulp.dest('dist/src/api/dist'));
});
gulp.task('swagger', ['copy-swagger'], function () {
  return gulp.src('dist/src/api/dist/index.html', {base: './'})
  .pipe(replace(/".*petstore.*"/g, '\'http://\' + document.location.host + \'/api/definition.json\''))
  .pipe(gulp.dest('./'));
})

gulp.task('prepublish', ['swagger']);
gulp.task('default', ['static', 'test']);
