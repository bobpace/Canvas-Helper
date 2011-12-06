var ImageHelper = function(src) {
  this.path = src;
};

ImageHelper.prototype.selected = function() {
  alert('selected');
};

$(function() {

    var viewModel = {
      images: ko.observableArray([
        new ImageHelper('Desert.jpg'),
        new ImageHelper('Jellyfish.jpg'),
        new ImageHelper('Tulips.jpg'),
        new ImageHelper('Hydrangeas.jpg'),
        new ImageHelper('Koala.jpg'),
        new ImageHelper('Penguins.jpg'),
        new ImageHelper('Lighthouse.jpg'),
        new ImageHelper('Chrysanthemum.jpg')
      ]),
      selectedImage: ko.observable('')
    };

    ko.applyBindings(viewModel);

    $(".thumbs").thumbs({strip:false});
    $(".viewport").canvasHelper({image: "./images/test.jpg"});
});
