(function($) {

  $.fn.canvasHelper = function(options) {

    var $container = $(this),
        $canvas = $container.find('canvas'),
        canvas = $canvas[0],
        ctx = canvas.getContext("2d"),
        settings = $.extend({}, options),
        src = settings['image'],
        innerCanvas = settings['innerCanvas'],
        drag = settings['drag'],
        drawScene = function(innerPosition) {
          if (innerCanvas) {
            innerPosition = innerPosition || {left: 0, top:0};
            ctx.drawImage(innerCanvas, innerPosition.left, innerPosition.top);
          }
          ctx.drawImage(image, 0, 0);
        },
        image,
        canvasHelper = {
          redraw: function(position) {
            drawScene(position);
          }
        };

    if (typeof drag === 'function') {
      $canvas.draggable({
        drag: function(event, ui) {
          var position = $canvas.position();
          drag(position);
        }
      });
    }

    if (src) {
      image = new Image();
      image.onload = function() {
        var left, top;

        canvas.width = image.width;
        canvas.height = image.height;

        left = ($container.width() - canvas.width)/2,
        top = ($container.height() - canvas.height)/2;

        $canvas.css({
          position:'absolute',
          top: top,
          left: left
        });

        drawScene();
      };
      image.src = src;
    }
    return canvasHelper;
  };

}(jQuery))
