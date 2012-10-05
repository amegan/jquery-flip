# jQuery Flip Plugin

jQuery/jQuery mobile plugin to give Flipboard app like effect. Flip effect uses css 3d transform. Flip effect currently works on WebKit browsers (e.g. Chrome, Safari, including iOS mobile safari) or Firefox 11. It still works with other browsers but the "slide" effect will be selected forecely.

## Compatibility
Current version is compatible with jQuery 1.6.4, 1.7.X, 1.8.X and jQuery Mobile 1.0, 1.1 and 1.2.

## Screenshots
![Flip right-to-left](http://amegan.github.com/jquery-flip/shot.png "Flip Right-to-Left")  ![Flip bottom-to-top](http://amegan.github.com/jquery-flip/shot2.png "Flip Bottom-to-Top")

## Installation

Copy jquery.mobile.flip.js, jquery.mobile.flip.css and images directory to your web page project. Note that css file and images folder must be in the same directory.

After copying files to your web project, load js and css file into your html.

    <!-- "images" directory must be copied under css folder -->
    <link rel="stylesheet" href="css/jquery.mobile.flip.css" />
    <script type="text/javascript" src="js/jquery.mobile.flip.js"></script>

## github page
[http://amegan.github.com/jquery-flip/](http://amegan.github.com/jquery-flip/ "jquery-flip on github page")

## Demo
[http://amegan.github.com/jquery-flip/demo/instagram.html](http://amegan.github.com/jquery-flip/demo/instagram.html "Instagram demo")


## Usage

### Prerequisite
This plugin expects nested `<div>`, `<p>`, `<section>` or `<article>` elements structure. Parent element of them will be used to initialize plugin.

    <div id="flipRoot">
       <!-- div element -->
       <div>
         Flip Content 1
       </div>
       <!-- or p element -->
       <p>
         Flip Content 2
       </p>
       <!-- or article element -->
       <artcile>
         Flip Content 3
       </article>
       <!-- or section element -->
       <section>
         <h3>Flip Content 4</h3>
         <p>You can put any elements under here</p>
       </section>
    </div>

### jQuery User
jQuery user can enable plugin by calling jQuery.flip() method.

    $(document).ready(function() {
      $("#flipRoot").flip();
    });

option object can be passed to the flip() method. Available options are described later.

    $(document).ready(function() {
      $("#flipRoot").flip({
        forwardDir: "ltor",
        height: "340px",
        showpager: true,
        loop: true}));
    });

### jQuery Mobile User
Plugin will be initialized with the element which has data-role="flip" attribute without calling initialization method.

    <div id="flipRoot" data-role="flip">
       <div>
         Flip Content 1
       </div>
       <p>
         Flip Content 2
       </p>
       <section>
         Flip Content 3
       </section>
    </div>

Option can be passed through data-flip- prefix attribute too.

    <div id="flipRoot" data-role="flip"  data-flip-show-pager="true" data-flip-forward-dir="ltor">
       <div>
         Flip Content 1
       </div>
       <p>
         Flip Content 2
       </p>
       <section>
         Flip Content 3
       </section>
    </div>

## Options
Following option is supported.

 option name | description | jqm attribute | value
-------------|-------------|---------------|------
effect |Transiton effect |data-flip-effect|'flip' or 'slide'
forwardDir |forward direction|data-flip-forward-dir|'rtol' or 'ltor' or 'ttob' or 'btot'
height |Content height   |data-flip-height| height css (e.g. 300px or 2in)
keyboardNav |enable keyboard navigation|data-flip-keyboard-nav|true or false
showPager |show pager |data-flip-show-pager|true or false
loop |loop contents |data-flip-loop|true or false

Sample:

    $(document).ready(function() {
      $("#flipRoot").flip({
        forwardDir: 'ltor',
        height: '340px',
        showpager: true,
        loop: true}));
    });

    <div id="flipRoot" data-role="flip"  data-flip-show-pager="true" data-flip-forward-dir="ltor">
       <div>
         Flip Content 1
       </div>
       <p>
         Flip Content 2
       </p>
       <section>
         Flip Content 3
       </section>
    </div>


## License

[The MIT License](http://www.opensource.org/licenses/mit-license.php "link to Open Source Initiative")
