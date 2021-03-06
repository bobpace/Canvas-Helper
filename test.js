
$(function() {
var ImageHelper = function(src) {
      this.path = this.imagePath + src;
    };

ImageHelper.prototype = {
  imagePath: './images/',
  selected: function() {
    viewModel.selectedImage(this);
  }
};
  var images = [
        new ImageHelper('test.jpg'),
        new ImageHelper('Jellyfish.jpg'),
        new ImageHelper('Tulips.jpg'),
        new ImageHelper('Hydrangeas.jpg'),
        new ImageHelper('Koala.jpg'),
        new ImageHelper('Penguins.jpg'),
        new ImageHelper('Lighthouse.jpg'),
        new ImageHelper('Chrysanthemum.jpg'),
        new ImageHelper('Jellyfish.jpg'),
      ],
      viewModel = {
        images: images,
        selectedImage: ko.observable('')
      };

  viewModel.selectedImage.subscribe(function(data) {
    var imageViewport = $("#image-viewport"),
        imageCanvas = imageViewport.find('canvas')[0]
        novellaViewport = $("#novella-viewport"),
        novellaCanvas = novellaViewport.find('canvas')[0],
        imageCanvasHelper = imageViewport.canvasHelper({
          image: data.path,
          drag: function(position) {
            novellaCanvasHelper.redraw(position);
          }
        }),
        novellaCanvasHelper = novellaViewport.canvasHelper({
          image: './images/previewWindow.png',
          innerCanvas: imageCanvas
        });
  });

  viewModel.selectedImage(images[0])

  ko.applyBindings(viewModel);

  $(".thumbs").thumbs();
});
