
var Click = function () {
  //object to hold all public methods
  var obj = {};

  //PRIVATE

  var OFFSET = 56;
  //helpers for Priority Plus menu
  function dropup ($dropdown, index) {
    var multiplier = index + 1;
    var topValue = parseInt($dropdown.css('top').split('px')[0], 0);
    var newTopValue = topValue - (OFFSET * multiplier);
    var newTopString = (newTopValue.toString()) + 'px';

    $dropdown.animate({
      'top': newTopString
    }, 200);
  };

  function dropdown ($dropdown) {
    var topValue = parseInt($dropdown.css('top').split('px')[0], 0);
    var newTopValue = isNaN(topValue) ? OFFSET : topValue + OFFSET;
    var newTopString = (newTopValue.toString()) + 'px';

    $dropdown.animate({
      'top': newTopString
    }, 200);
  };

  function drop ($dropdown, index) {
    //establish baseline value for top (the CSS attr)
    if ($dropdown.hasClass('visible')){
      dropup($dropdown, index);
      $dropdown.removeClass('visible');
    } else {
      dropdown($dropdown);
      $dropdown.addClass('visible');
    }
  };

  function menuClickEmitter($target, index) {
    $target.on('click', 'a', function ( e ) {
      //quick default anchor tag prevention
      if($target.attr('href') === '#'){
        event.preventDefault();
      }

      //emit an event to be handled differently according to index number in accordianArray
      $target.trigger('menu:click:' + index);
    });
  };

  function menuClickListener(accordianArray, $target, index) {
    $target.on('menu:click:' + index, function () {
      //toggle assigned dropdown visibility
      var $dropdown = $(accordianArray[index].dropdownSelector);
      drop($dropdown, 0);

      //get child dropdown elements
      var otherDropdowns = _.filter(accordianArray, function (menuObject) {
        return accordianArray.indexOf(menuObject) > index
      });

      // shouldn't affect menus without children
      otherDropdowns.forEach(function (dropdownObj) {
        var $dropdown = $(dropdownObj.dropdownSelector);

        //top condition should only apply to grandparent elements
        if ( $target.hasClass('triggered') && $dropdown.hasClass('visible')) {
          drop($dropdown, index + 1);
        } else if ( $target.hasClass('triggered')) {
          dropup($dropdown, index)
        } else {
          dropdown($dropdown);
        }
      });

      $target.hasClass('triggered') ? $target.removeClass('triggered') : $target.addClass('triggered');
    });
  }
  //PUBLIC
  //Priority Plus menu JavaScript
  obj.priorityMenu = function (accordianArray) {
    //accordianArray should be an array of Objects. The order should be from top -> bottom, with an anchorSelector and dropdownSelector defined for each item in the array

    _.each(accordianArray, function (menuObject) {
      var $target = $(menuObject.anchorSelector);
      var index = accordianArray.indexOf(menuObject);

      menuClickEmitter($target, index);
      menuClickListener(accordianArray, $target, index);
    });
  };

  //scroll to IDs on the page
  obj.scroller = function(){
    $('a').click(function(){
      var href = $.attr(this, 'href');
      //only run if href points to something other than '#'
      if (href === '#'){
        event.preventDefault();
      } else {
        $('html, body').animate({
            scrollTop: $(href).position().top
        }, 700, function () {
            window.location.hash = href;
        });
      }

    });
  };
  //city selector buttons (takes the Links object as an input)
  obj.cities = function (Links, Helpers) {
    $('#location-picker').on('click','li',function(){
      var $target = $(this);
      //sets active/inactive style for buttons on click
      if($target.hasClass('active') === false){
        $target.siblings('li').removeClass('active');
        $target.addClass('active');
      }

      //sets city variable by reading the text content of the clicked city button
      var city = $target.text().replace(/[^\w]/gi,"").toLowerCase();

      //grabs data from invoked Link object (built via function)
      var CityLinks = Links[city];

      //fires linkSwitch() on the object of city links
      Helpers.linkSwitch(CityLinks);
    });
  };
  //Week-By-Week Curriculum revealer
  obj.slides = function () {
    $('#syllabus').on('click','li', function(){
      var n = $(this).index() + 1;
      var currentSlide = $('.active-slide');
      var nextSlide = $('div.slide:nth-child(' + n + ')');

      //animate buttons
      $(this).siblings('li').animate({
        'opacity':'0.6'
      }, 100);
      $(this).animate({
        'opacity':'1'
      }, 100);

      //change slides
      currentSlide.fadeOut(100).removeClass('active-slide');
      nextSlide.fadeIn(100).addClass('active-slide');
    });
  };
  //FAQ page active response revealer
  obj.faq = function(){
    $('#faq-list').on('click','li',function(){
      var target = $(this).children('.response');
      var others = $(this).siblings('li').children('.response');
      if (target.hasClass('.active-response')) {
        target.removeClass('.active-response').slideUp(300);
      } else {
        others.removeClass('.active-response').slideUp(300);
        target.addClass('.active-response').slideDown(300);
      }
    });
  };

  return obj;
};
