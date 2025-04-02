const gulp = require('gulp');
const inlinesource = require('gulp-inline-source');
const replace = require('gulp-replace');

gulp.task('default', () => {
  return gulp
    .src('./build/index.html')
    .pipe(replace('.js"></script>', '.js" inline></script>'))
    .pipe(replace('rel="stylesheet">', 'rel="stylesheet" inline>'))
    .pipe(
      inlinesource({
        compress: false,
        rootpath: 'build',
        ignore: ['png', 'jpg', 'svg', 'ico'],
      })
    )
    .pipe(gulp.dest('./dist'));
});
