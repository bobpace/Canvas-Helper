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
      ],
      $mainCanvas = $("#image-viewport"),
      $previewCanvas = $("#novella-viewport"),
      mainCanvas = new NovellaCanvas({
        '$element': $mainCanvas
      }),
      previewCanvas = new NovellaCanvas({
        overlaySrc: './images/previewWindow.png',
        '$element': $previewCanvas
      });

  
  loadImages({
      target: '#design-images',
      images: images,
      clickHandler: function() {
        var $this = $(this),
            imageInfo = $this.data('image-info');

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
      var target = $(settings['target']),
          $element = $("<li>"),
          novellaCanvas = new NovellaCanvas({
            overlaySrc: './images/previewWindow.png',
            '$element': $element
          });

      $element.data('novella-canvas', novellaCanvas)
      target.append($element);
    });
  }

  function NovellaCanvas(options) {
    var overlayImage,
        self = this;

    $.extend(this, options);

    if (this.overlaySrc) {
      overlayImage = new Image();
      overlayImage.onload = function() {
        self.draw({width: this.width, height: this.height});
      };
      overlayImage.src = this.overlaySrc;
    }

    this.draw = function(size) {
      var canvas = $('<canvas>')[0],
          context = canvas.getContext('2d');

      canvas.height = size.height;
      canvas.width = size.width;

      if (overlayImage) {
        context.drawImage(overlayImage, 0, 0);
      }
      this.$element.html(canvas);
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

        $image.data('image-info', {
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
