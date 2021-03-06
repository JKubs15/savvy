(function(){
    "use strict";

    //set up requires for gulp tasks
    var gulp = require("gulp");
    var usemin = require('gulp-usemin');
    var uglify = require('gulp-uglify');
    var minifyHtml = require('gulp-minify-html');
    var minifyCss = require('gulp-minify-css');
    var imagemin = require('gulp-imagemin');
    var pngquant = require('imagemin-pngquant');
    var gzip = require('gulp-gzip');
    var critical = require('critical');
    var useref = require('gulp-useref');
    var gulpif = require('gulp-if');
    var sitemap = require('gulp-sitemap');
    var autoprefixer = require('gulp-autoprefixer');
    var sync = require('browser-sync').create();


  //DEVELOPMENT ENVIRONMENT TASKS (for ./build)
    //port in relevant content without any async operations
    gulp.task('dev-port',function(){
      gulp.src(['_site/index.html','_site/src/**/*','!_site/src/blog','./theme'])
        .pipe(gulp.dest('build/'));
      gulp.src('_site/blog/**/*')
        .pipe(gulp.dest('build/blog/'));
      gulp.src('theme/**/*')
        .pipe(gulp.dest('build/theme/'));
      gulp.src('node_modules/jquery/**/*')
        .pipe(gulp.dest('build/node_modules/jquery'));
      gulp.src('node_modules/picturefill/**/*')
        .pipe(gulp.dest('build/node_modules/picturefill'));
      gulp.src('theme/fonts/themify-icons/fonts/**/*')
        .pipe(gulp.dest('build/theme/fonts/'));
    });
    //set up watcher
    gulp.task('dev-watch', ['dev-port'], sync.reload);

    //browserSync server
    gulp.task('serve', ['dev-port'], function(){
      sync.init({
        server:{
          baseDir: "./build"
        }
      });
      gulp.watch(['theme/css/*', 'theme/js/*'],['dev-watch']);
    });

    //browserSync for overview.html and class-materials
    gulp.task('class', function () {
      sync.init({
        server:{
          baseDir:'src/class-slides/class-materials'
        }
      });
      gulp.watch(['src/class-slides/class-materials/**/*'], sync.reload);
    });

  //DEPLOYMENT BUILD TASKS (outside of ./public)
    //css auto-prefixer for compatibility (pre-build)
    gulp.task('autoprefixer', function(){
      return gulp.src('./theme/css/*.css')
        .pipe(autoprefixer({
          browsers: ['last 2 versions'],
          cascade:'false'
          }))
        .pipe(gulp.dest('./theme/css/'));
    });

  //DEPLOYMENT BUILD TASKS (in ./public)
    //Porters of content outside of _site directory
    gulp.task('font-port', function(){
      gulp.src(['theme/fonts/themify-icons/fonts/**/*'])
        .pipe(gulp.dest('public/theme/fonts'));
    });
    gulp.task('other-image-port', function () {
        gulp.src(['theme/images/**/*.svg','theme/images/**/*.ico'])
            .pipe(gulp.dest('public/theme/images'));
    });

    //Porters of unmodified _site content (class-slides and post directories)
    gulp.task('class-port',function() {
      gulp.src('_site/src/class-slides/**/*')
        .pipe(gulp.dest('public/class-slides'));
    });

    gulp.task('blog-port', function () {
      gulp.src('build/blog/**/*')
        .pipe(gulp.dest('public/blog'));
    });

    //image minifier (no CSS, HTML, or JS)
    gulp.task('image-min', function () {
        gulp.src(['theme/images/**/*.jpg','theme/images/**/*.png'])
            .pipe(imagemin({
              optimizationLevel: 7,
              progressive:true,
              use: [pngquant()]
            }))
            .pipe(gulp.dest('public/theme/images'));
    });
    //surge-css porter
    gulp.task('surge-port', function () {
      gulp.src(['theme/css/surge.css'])
        .pipe(gulp.dest('public/theme/css'));
    });

    //CSS and JS minifier, retaining async on javascript files, after all other files have been ported over
    gulp.task('async',['font-port','other-image-port', 'class-port', 'blog-port', 'surge-port', 'autoprefixer'],function(){
      return gulp.src(['_site/src/**/*.html','_site/index.html','!_site/src/class-slides'])
        .pipe(useref({searchPath:'.'}))
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest('./public'));
    });

    //Sitemap generator for SEO and search engine ease-of-use (XML format)
    gulp.task('sitemapper',['async'],function() {
        return gulp.src('public/**/*.html')
          .pipe(sitemap({
            siteUrl: 'https://savvycoders.com'
          }))
          .pipe(gulp.dest('./public'));
    });

    //CSS inliner post-CSS and JS minification, pre-HTML minification and gzipping
    gulp.task('css-inline',['sitemapper'], function(){
      return critical.generateInline({
        base:'public/',
        src:'index.html',
        dest: 'public/index.html',
        width: 1300,
        height: 900
      });
    });

    //HTML minifier (run after ports, image-minification, and critical CSS inlining)
    gulp.task('cruncher', ['css-inline'], function() {
       gulp.src('public/index.html')
        .pipe(usemin({
            assetsDir: '.',
            html: [minifyHtml({empty:true})]
        }))
        .pipe(gulp.dest('public'));
    });

    //default task (gzips final files)
    gulp.task('default',['cruncher'],function () {
      gulp.src(['public/**/*','!public/**/*.gz','!public/**/*.md','!public/**/*.txt', '!public/**/*.json','!public/**/*.xml', '!public/theme/images/**/*'])
        .pipe(gzip()).pipe(gulp.dest('public'));
    });

    //build deployment task using SFTP
    gulp.task('deploy',function() {
        //exec child-process to start SFTP from command line
    });
}());
