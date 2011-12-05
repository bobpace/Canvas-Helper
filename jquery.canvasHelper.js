(function($) {

  $.fn.canvasHelper = function(options) {

    var settings = $.extend({}, options);

    return this.each(function() {
      var $container = $(this),
          $canvas = $container.find('canvas'),
          canvas = $canvas[0],
          src = settings['image'],
          image;

      if (src) {
        image = new Image();
        image.onload = function() {
          var ctx, left, top;

          canvas.width = image.width;
          canvas.height = image.height;

          ctx = canvas.getContext("2d"),
          left = ($container.width() - canvas.width)/2,
          top = ($container.height() - canvas.height)/2;

          $canvas.css({position:'absolute', top: top, left: left});
          ctx.drawImage(image, 0, 0);
        };
        image.src = src;
      }
    });
  };

}(jQuery))
