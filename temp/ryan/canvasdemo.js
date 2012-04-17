



$('#save').click(function () {
    cdMain.saveFinalAsset(); //draw.js
});

//--------- SCALE
$("#slider-vertical").slider({
    orientation: "vertical",
    range: "min",
    min: 0,
    max: 100,
    value: 100,
    slide: function (event, ui) {
        $("#amount").val(ui.value);
        cdMain.scale = parseInt(ui.value);
        cdMain.redraw();
    }
});
$("#amount").val($("#slider-vertical").slider("value"));

//--------- BLACK/WHITE
$('#colorOptions').change(function () {
    if ($(this).val() == 'gray') {
        cdMain.isGray = true;
        cdMain.redraw(); //draw.js
    }
    else {
        cdMain.isGray = false;
        cdMain.redraw(); //draw.js
    }
});

//--------- ROTATE
$('#rotateLeft').click(function () {
    cdMain.rotation = cdMain.rotation == 0 ? 270 : cdMain.rotation - cdMain.rotationIncrement;
    cdMain.redraw(); //draw.js
});

$('#rotateRight').click(function () {
    cdMain.rotation = cdMain.rotation == 270 ? 0 : cdMain.rotation + cdMain.rotationIncrement;
    cdMain.redraw(); //draw.js
});

//--------- THUMBNAIL LOADS
$('#thumbnailContainer li img').click(function () {
    cdMain.unload();
    cdMain = new canvasDetails("myCanvas", 550, 350);
    cdMain.loadImage($(this).attr('data-fullsrc'));
});
