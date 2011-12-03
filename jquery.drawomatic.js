(function($) {
  $.fn.drawomatic = function(options) {
      var settings = $.extend({
          //default options here
          }, options),
          center = function(parent, canvas) {
            var left = (parent.width() - canvas.outerWidth())/2,
                top = (parent.height() - canvas.outerHeight())/2;
            canvas.css({
              position: 'absolute',
              left: left,
              top: top
            });
          },
          drawImage = function(parent, canvas) {
            var src = settings['image'],
                image;

            if (src) {
              image = new Image();
              image.onload = function() {
                var ctx = canvas[0].getContext("2d");
                canvas.width(image.width);
                //canvas.height(image.height);
                ctx.drawImage(image, 10, 10);
                //center(parent, canvas);
              };
              image.src = src;
            }
          };

      return this.each(function() {
        var $this = $(this),
            canvas = $this.find('canvas');

        if (canvas.size()) {
          drawImage($this, canvas);
        }
      });
  };

}(jQuery))
