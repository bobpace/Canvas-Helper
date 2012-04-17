

function canvasDetails(canvasId, width, height) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.width = width;
    this.canvas.height = height;
    //this.context = this.canvas.getContext("2d");
    this.image = new Image();
    this.prevX, this.prevY, this.x, this.y, this.centerX, this.centerY, this.startCenterX, this.startCenterY; //Refactor to positioning class?
    this.scale = 100;
    this.rotationIncrement = 90; //Cannot change this without some refactoring, other code assumes 90 degree increments
    this.rotation = 0;
    this.isGray = false;
    this.mirrorW = 153;
    this.mirrorH = 190;

    //Methods
    this.loadImage = loadImage;
    this.redraw = redraw;
    this.redrawOverloaded = redrawOverloaded;
    this.convertGray = convertGray;
    this.saveFinalAsset = saveFinalAsset;
    this.unload = unload;

    //Event wireups
    $(this.canvas).bind('mousedown', { cd: this }, canvasMouseDown);
    $(this.canvas).bind('mouseup', { cd: this }, canvasMouseUp);
    $(this.canvas).bind('mousemove', { cd: this }, canvasMouseMove);

    // Keep track even if mouse is outside of canvas while dragging image
//    window.addEventListener(mouse + 'up', function (e) { mouseUpWindow(getEvent(e)); }, false);
//    window.addEventListener(mouse + 'move', function (e) { mouseMoveWindow(getEvent(e)); }, false);
}

var cdMain;
$(document).ready(function () {
    cdMain = new canvasDetails("myCanvas", 460, 350);
    cdMain.loadImage("/Content/images/IMG_3977 copya.jpg");
});

function loadImage(file) {
    this.image = new Image();
    $(this.image).load({ cd: this }, onImageLoaded);
    this.image.src = file;
}

function onImageLoaded(e) {
    var cd = e.data.cd;

    var xRatio = cd.canvas.width / this.width;
    var yRatio = cd.canvas.height / this.height;

    cd.scale = xRatio > yRatio ? yRatio * 100 : xRatio * 100;
    $("#slider-vertical").slider("value", cd.scale);
    $("#amount").val(Math.round(cd.scale));

    cd.centerX = cd.startCenterX = (cd.canvas.width / 2) / (cd.scale / 100); //cd.canvas.width / 2;
    cd.centerY = cd.startCenterY = (cd.canvas.height / 2) / (cd.scale / 100); //cd.canvas.height / 2;

    var mirrorCanvas = document.getElementById('mirrorCanvas');
    mirrorCanvas.width = cd.mirrorW;
    mirrorCanvas.height = cd.mirrorH;

    cd.redraw();
}

function unload() {
    $(this.canvas).unbind();
    $(this.image).unbind();
    $('#colorOptions').val('color');
}

function redraw() { this.redrawOverloaded(true); }

function redrawOverloaded(renderMirror) {
    var context = this.canvas.getContext('2d'); // Grab the context
    context.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear the canvas
    context.save(); // Save the current context

    // Translate to the center point of our canvas (because I want all zoom and rotate to happen at center of canvas, not center of image)
    context.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);
    
    // Zoom
    context.scale(this.scale / 100, this.scale / 100);

    // Rotate
    context.rotate(this.rotation * Math.PI / 180);

//    $('#centerX').text(this.centerX);
//    $('#centerY').text(this.centerY);

    // Translate to where the top left of image should start
    context.translate(
        -this.image.width * 0.5 + (this.centerX - this.startCenterX),
        -this.image.height * 0.5 + (this.centerY - this.startCenterY));

    context.drawImage(this.image, 0, 0);

    context.restore(); // Restore the context for the next redraw

    if (this.isGray)
        this.convertGray(context);

    // Mirror the image data to the other canvas
    if (renderMirror) {
        var data = context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        var mirrorContext = document.getElementById('mirrorCanvas').getContext('2d');
        mirrorContext.putImageData(data, -((this.canvas.width / 2) - (this.mirrorW / 2)), -((this.canvas.height / 2) - (this.mirrorH / 2)));
    }
}

//--------- DRAG the image inside the canvas
function canvasMouseDown(e) {
    var cd = e.data.cd;
    cd.x = cd.prevX = e.clientX - this.offsetLeft;
    cd.y = cd.prevY = e.clientY - this.offsetTop;
}

function canvasMouseUp(e) {
    var cd = e.data.cd;
    cd.x = cd.y = cd.prevX = cd.prevY = null;
//    alert("startCenterX:" + cd.startCenterX + ",startCenterY:" + cd.startCenterY);
}

function canvasMouseMove(e) {
    var cd = e.data.cd;
    if (cd.x == null || cd.y == null) {
        return;
    }

    cd.x = e.clientX - this.offsetLeft;
    cd.y = e.clientY - this.offsetTop;
    if (cd.prevX == null) { cd.prevX = x; }
    if (cd.prevY == null) { cd.prevY = y; }

    //Figure out whether to add or subtract x and y based on the current rotation
    var xFactor = cd.x - cd.prevX, yFactor = cd.y - cd.prevY;
    switch (cd.rotation) {
        case 90:
            xFactor = cd.y - cd.prevY;
            yFactor = cd.prevX - cd.x;
            break;
        case 180:
            xFactor = cd.prevX - cd.x;
            yFactor = cd.prevY - cd.y;
            break;
        case 270:
            xFactor = cd.prevY - cd.y;
            yFactor = cd.x - cd.prevX;
            break;
    }

    //Add the scale factor
    xFactor = xFactor / (cd.scale / 100);
    yFactor = yFactor / (cd.scale / 100);

    cd.centerX = cd.centerX + xFactor;
    cd.centerY = cd.centerY + yFactor;
    cd.prevX = cd.x;
    cd.prevY = cd.y;

    cd.redraw();
}

function convertGray(context) {
    var grayImageData = context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var data = grayImageData.data;

    for (var i = 0; i < data.length; i += 4) {
        var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];

        data[i] = brightness; // red
        data[i + 1] = brightness; // green
        data[i + 2] = brightness; // blue
        // i+3 is alpha (the fourth element)
    }

    context.putImageData(grayImageData, 0, 0);
}

function saveFinalAsset() {
    //reverse the scale on both the canvas and the drawn image
    //(full size image and the canvas will match it appropriately based on where the user had zoomed to)
    var tempCD = new canvasDetails("tempCanvas",
        this.mirrorW / (this.scale / 100),
        this.mirrorH / (this.scale / 100));

    tempCD.image = this.image;
    tempCD.rotation = this.rotation;
    tempCD.isGray = this.isGray;
    tempCD.startCenterX = this.startCenterX;
    tempCD.startCenterY = this.startCenterY;
    tempCD.centerX = this.centerX;
    tempCD.centerY = this.centerY;

    tempCD.redrawOverloaded(false);
}
