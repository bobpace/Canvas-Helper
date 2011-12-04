(function($) {

  $.fn.canvasHelper = function(options) {

    var settings = $.extend({}, options);

    return this.each(function() {
      var canvas = this,
          $canvas = $(this),
          src = settings['image'],
          image;

      if (this.tagName !== "CANVAS") {
        return;
      }

      canvas.width = $canvas.width();
      canvas.height = $canvas.height();

      if (src) {
        image = new Image();
        image.onload = function() {
          var ctx = canvas.getContext("2d"),
              left = (canvas.width - image.width)/2,
              top = (canvas.height - image.height)/2;
          ctx.drawImage(image, left, top);
        };
        image.src = src;
      }
    });
  };

}(jQuery))
