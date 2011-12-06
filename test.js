$(function() {
    var viewModel = {
      images: ko.observableArray([
        {path: 'Desert.jpg'},
        {path: 'Jellyfish.jpg'},
        {path: 'Tulips.jpg'},
        {path: 'test.jpg'},
      ])
    };

    ko.applyBindings(viewModel);

    $(".thumbs").thumbs();
});
