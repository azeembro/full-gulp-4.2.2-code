//const {src, task, watch, series, parallel, dest  } = require('gulp');

var gulp = require ('gulp');
var rename = require ('gulp-rename');
var dartSass = require ('sass');
var gulpSass = require ('gulp-sass');
var uglify = require ('gulp-uglify');
const sass = gulpSass(dartSass);
var autoprefixer = require ('gulp-autoprefixer');
var sourcemaps = require ('gulp-sourcemaps');
var browserify = require ('browserify');
var babelify = require ('babelify');
var source = require ('vinyl-source-stream');
var buffer = require ('vinyl-buffer');
var browserSync = require ('browser-sync').create();
var plumber = require ('gulp-plumber');
var options = require ('gulp-options');
var gulpif = require ('gulp-if');
var notify = require ('gulp-notify');

var styleSRC = './src/scss/style.scss';
var styleURL = './dist/css/';
var styleWatch = 'src/scss/**/*.scss';
var mapURL  = './';


var jsSRC = './src/js/';
var jsFront = 'main.js';
var jsDIST = './dist/js/';
var jsWatch = 'src/js/**/*.js';
var jsFiles = [jsFront];
var jsURL = './dist/js/';


var imgSRC = './src/images/**/';
var imgURL = './dist/images/';

var fontsSRC = './src/fonts/**/*';
var fontsURL = './dist/fonts/';

var htmlSRC = './src/**/*.html';
var htmlURL = './dist/';

var styleWatch = './src/scss/**/*.scss';
var jsWatch = './src/js/**/*.js';
var imgWatch = './src/images/**/*.*';
var fontsWatch = './src/fonts/**/*.*';
var htmlWatch = './src/**/*.html';



function browser_sync(){

    browserSync.init({
       server:{
        baseDir: './dist/'
        }
    });

}

function reload(done){
    browserSync.reload();
    done();
};

function  css(done){
    gulp.src( styleSRC )
    .pipe( sourcemaps.init() )
    .pipe( sass( {  
        errorLogToConsole: true,
        outputStyle: 'compressed'
    }) )
    .on( 'error', console.error.bind( console ) )
    .pipe(autoprefixer( { 
        browsers: ['last 2 versions'],
         cascade: false 
        } ) ) 
    .pipe( rename ( { suffix : '.min' }) )
    .pipe (sourcemaps.write ('./') )
    .pipe( gulp.dest( styleURL ) )
    .pipe( browserSync.stream() );

    done();
}

function js(done){

    jsFiles.map( function( entry ){
        return browserify({
            entries: [jsURL + entry]
        })
        .transform( babelify, { presets: ['@babel/preset-env']} )
        .bundle()
        .pipe( source( entry ) )
        .pipe( rename( {extname: '.min.js'} ))
        .pipe( buffer() )
        .pipe( sourcemaps.init({ loadMaps: true }))
        .pipe ( uglify() )
        .pipe ( sourcemaps.write( './' ) )
        .pipe( gulp.dest( jsDIST ) )
        .pipe( browserSync.stream() );
    });
    done();
}

function triggerPlumber(src_file, dest_file){
    return gulp.src(src_file)
        .pipe(plumber())
        .pipe(gulp.dest(dest_file));
}

function images(){
   return triggerPlumber(imgSRC, imgURL);    
};

function fonts(){
   return triggerPlumber(fontsSRC, fontsURL);   
};

function html(){
   return triggerPlumber(htmlSRC, htmlURL);
};


function watch_files(){
    gulp.watch(styleWatch, gulp.series(css, reload));
    gulp.watch(jsWatch, gulp.series(js, reload));
    gulp.watch(imgWatch, gulp.series(images, reload));
    gulp.watch(fontsWatch, gulp.series(fonts, reload));
    gulp.watch(htmlWatch, gulp.series(html, reload));
    gulp.src( jsURL + 'main.min.js')
    .pipe( notify( { message: 'Gulp is Watching Happy Coding' }) );
}

gulp.task("css", css);
gulp.task("js", js);
gulp.task("images", images);
gulp.task("fonts", fonts);
gulp.task("html", html);

gulp.task("default", gulp.parallel(css, js, images, fonts, html));
gulp.task("watch", gulp.parallel(browser_sync, watch_files) )

