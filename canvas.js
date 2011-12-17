(function(){

  var images = [
        'Chrysanthemum.jpg',
        'Jellyfish.jpg',
        'Desert.jpg',
        'Hydrangeas.jpg',
        'Koala.jpg',
        'Lighthouse.jpg',
        'Penguins.jpg',
        'test.jpg',
        'Tulips.jpg',
      ],
      items = [
        {},
        {},
        {},
        {},
        {},
      ];

  
  loadImages({
      target: '#design-images',
      images: images,
      clickHandler: function() {
        var $this = $(this),
            imageInfo = $this.data('imageInfo');

        console.log(imageInfo.imagePath);
      }
    }
  );

  loadItems({
      target: '#design-items',
      items: items
    }
  );

  function loadItems(options) {
    var settings = $.extend({}, options),
        items = settings['items'];

    $.each(items, function(index, value) {
      var target = $(settings['target']);
      target.append($("<li>").data('novella-canvas', new NovellaCanvas({
        overlaySrc: './images/previewWindow.png'
      })));
    });
  }

  function NovellaCanvas(options) {
    var settings = $.extend({}, options),
        overlaySrc = settings['overlaySrc'],
        overlayImage;

    if (overlaySrc) {
      overlayImage = new Image();
      overlayImage.onload = function() {
      };
      overlayImage.src = this.overlaySrc = overlaySrc;
    }

    this.draw = function(element) {
      var canvas = $('<canvas>')[0],
          context = canvas.getContext('2d');

      if (overlayImage) {
        context.drawImage(overlayImage, 0, 0);
      }
      element.html(canvas);
    };
  }

  function loadImages(options) {
    var defaults = {width: 75, height: 75},
        settings = $.extend({}, defaults, options),
        images = settings['images'],
        clickHandler = settings['clickHandler'];

    $.each(images, function(index, value) {
      var image = new Image(),
          imagePath = "./images/" + value,
          target = $(settings['target']);

      image.src = imagePath;
      image.onload = function() {
        var size = settings,
            actualHeight = this.height,
            actualWidth = this.width,
            newSize = determineSize(size, this),
            margin = determineMargin(size, newSize),
            $image = $(image),
            $this = $(this);

        this.width = newSize.width;
        this.height = newSize.height;
        $this.css({
          margin: margin
        });
        $this.addClass('unselectable');

        if (typeof clickHandler === 'function') {
          $image.click(clickHandler);
        }

        $image.data('imageInfo', {
          width: actualWidth,
          height: actualHeight,
          imagePath: imagePath
        })

        target.append($("<li>").css({width: settings.width, height: settings.height}).append(image));
      };
    });
  }

  function determineMargin(containerSize, actualSize) {
    var topMargin = 0,
        sideMargin = 0;

    if (containerSize.width > actualSize.width) {
      sideMargin = (containerSize.width - actualSize.width) / 2;
    }
    else if (containerSize.height > actualSize.height) {
      topMargin = (containerSize.height - actualSize.height) / 2;
    }
    return topMargin + "px " + sideMargin + "px";
  }


  function determineSize(boundingBox, sourceBox) {
    var max_width = boundingBox.width,
        max_height = boundingBox.height,
        width = sourceBox.width,
        height = sourceBox.height;

    if (width > height) {
      if (width > max_width) {
        height *= max_width / width;
        width = max_width;
      }
    }
    else {
      if (height > max_height) {
        width *= max_height / height;
        height = max_height;
      }
    }

    return {
      width: width,
      height: height
    };
  }

}())
