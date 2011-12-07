
$(function() {
  var ImageHelper = function(src) {
        this.path = this.imagePath + src;
      }, 
      images,
      viewModel;

    ImageHelper.prototype.imagePath = './images/';
    ImageHelper.prototype.selected = function() {
      viewModel.selectedImage(this);
    };

    images = [
      new ImageHelper('test.jpg'),
      new ImageHelper('Jellyfish.jpg'),
      new ImageHelper('Tulips.jpg'),
      new ImageHelper('Hydrangeas.jpg'),
      new ImageHelper('Koala.jpg'),
      new ImageHelper('Penguins.jpg'),
      new ImageHelper('Lighthouse.jpg'),
      new ImageHelper('Chrysanthemum.jpg'),
      new ImageHelper('Jellyfish.jpg'),
    ];

    viewModel = {
      images: images,
      selectedImage: ko.observable('')
    };

    viewModel.selectedImage.subscribe(function(data) {
      var imageViewport = $("#image-viewport"),
          imageCanvas = imageViewport.find('canvas')[0]
          novellaViewport = $("#novella-viewport"),
          $novellaCanvas = novellaViewport.find('canvas');

      imageViewport.canvasHelper({
        image: data.path,
        drag: function(position) {
          //TODO: update novella with new coordinates
        }
      });
      novellaViewport.canvasHelper({
        image: './images/previewWindow.png',
        innerCanvas: imageCanvas
      });
    });

    viewModel.selectedImage(images[0])

    ko.applyBindings(viewModel);

    $(".thumbs").thumbs();
});
