//START GLOBAL VARIABLES
var canvas3 = document.createElement('canvas');
var canvas4 = document.createElement('canvas');
var canvas5 = document.createElement('canvas');

//Initialize Main Canvas and Preview Canvas
var srcImg = new Image();
var canvas;
var canvasp;
var ctx;
var ctx2;

var init = 1;
var btnStatus;
//Lighten Image
var newLightenVal = 0;
var val = 50;
var m = 0;
//Scale Image
var scale = 1;
//Rotatate
var deg = 0;
//Flip
var flipx = false;
var flipy = false;
//Draggable Margin
var InitMargin;
var leftM;
var leftM2;


//END GLOBAL VARIABLES

function onDesignInit() {

    //Get frame ratio and fit the wrapping div to the correct size
    var frameHeight = $('#PreviewFrame').height();
    var frameWidth = $('#PreviewFrame').width();
    var frameDifference = ($('div.designPreview .brdr').width() - frameWidth) / 2;
    $('div.designPreviewItem').css({ 'margin-left': frameDifference });
    $('#PreviewWrapper').width(frameWidth).height(frameHeight);

    //Reset Image
    $('#ResetPic').click(function () {
        resetCanvas();
        draw();
        setSelectedNovella(false);
    });

    //Lighten Image
    $('#Lighten').wrap('<div id="LightenSlider" class="hide">');
    $('div.lightenControl').hover(
                function () {
                    if (!$('#MainBtns').hasClass('noImage')) {
                        $('#LightenSlider').show();
                    }
                }, function () {
                    $('#LightenSlider').hide();
                });
    if (!checkBrowser()) {
        val = 0;
        m = 50;
    }
    $("#Lighten").slider({
        orientation: 'vertical',
        range: 'min',
        min: m,
        max: 100,
        slide: function (event, ui) {
            newLightenVal = ((ui.value / 100 * 2) - 1).toFixed(2);
            $("#lightenVal").val(newLightenVal);
            draw();
            setSelectedNovella(false);
            if (newLightenVal == 0) {
                $('#Light').removeClass('btnSelected');
            } else {
                $('#Light').addClass('btnSelected');
            }
        },
        value: val,
        step: 5
    });
    /***** End Lighten *****/

    //Size Image
    $('#Size').wrap('<div id="SizeSlider" class="hide">');
    $('div.sizeControl').hover(
                function () {
                    if (!$('#MainBtns').hasClass('noImage')) {
                        $('#SizeSlider').show();
                    }
                }, function () {
                    $('#SizeSlider').hide();
                });

    $("#Size").slider({
        orientation: 'vertical',
        range: 'min',
        min: 5,
        max: 100,
        slide: function (event, ui) {
            scale = (ui.value / 100).toFixed(2);
            draw();
            setSelectedNovella(false);
        },
        value: 100,
        step: 1
    });
    /***** End Size Image *****/

    //Rotate Image
    $('a.rotator').click(function () {
        var direction = $(this).attr('rel');
        if (direction == 'ccw') {
            if ((flipy == true && flipx == false) || (flipy == false && flipx == true)) {
                deg += 45;
            } else {
                deg -= 45;
            }
        } else {
            if ((flipy == true && flipx == false) || (flipy == false && flipx == true)) {
                deg -= 45;
            } else {
                deg += 45;
            }
        }
        draw();
        setSelectedNovella(false);
    });
    /***** End Rotate Image *****/

    //Flip Image
    $('a.flip').click(function () {
        if ($(this).hasClass('btnSelected')) {
            $(this).removeClass('btnSelected');
        } else {
            $(this).addClass('btnSelected');
        }
        setSelectedNovella(false);
        if ($('a.flip.horizontal').hasClass('btnSelected')) {
            flipy = true;
        } else {
            flipy = false;
        }
        if ($('a.flip.vertical').hasClass('btnSelected')) {
            flipx = true;
        } else {
            flipx = false;
        }
        draw();
        setSelectedNovella(false);
    });
    /***** End Flip Image *****/

    $('#DesignApproval').click(function () {
        //SaveCanvasImage('MainCanvas', 'Main');
        setSelectedNovella(true);
        var result = checkApprovals();
        allApproved(result);

        draw(true);
        $('#PreviewFrame').hide();
        var ID = $('ul.designItems .selected').index();
        approved[selected] = true;
        $('#preview, div.selectedImage').hide();
        $('img.itemImagePreview.' + selected).show();
        $('ul.designItems').removeClass('inactive');

        if (typeof FlashCanvas != "undefined") {
            FlashCanvas.initElement(canvas3);
            FlashCanvas.initElement(canvas4);
            FlashCanvas.initElement(canvas5);
        }

        if (ID == 0) {
            $('#Designed_1').remove();
            $(canvas3).attr('id', 'Designed_1');
            var ctx3 = document.getElementById('item_1').appendChild(canvas3).getContext('2d');
            canvas3.width = $('#item_1').width();
            canvas3.height = $('#item_1').height();
            var test = $('ul.designItems .selected').width() / $('#PreviewFrame').width();
            //var test = (($('ul.designItems .selected').width() / $('#PreviewFrame').width()) + ($('ul.designItems .selected').height() / $('#PreviewFrame').height())) / 2;
            ctx3.scale(scale * test, scale * test);
            ctx3.drawImage(srcImg, 0, 0);
            //                    SaveCanvasImage('Designed_1');
        }
        if (ID == 1) {
            $('#Designed_2').remove();
            $(canvas4).attr('id', 'Designed_2');
            var ctx4 = document.getElementById('item_2').appendChild(canvas4).getContext('2d');
            canvas4.width = $('#item_2').width();
            canvas4.height = $('#item_2').height();
            ctx4.drawImage(srcImg, 0, 0);
            //                    SaveCanvasImage('Designed_2');
        }
        if (ID == 2) {
            $('#Designed_3').remove();
            $(canvas5).attr('id', 'Designed_3');
            var ctx5 = document.getElementById('item_3').appendChild(canvas5).getContext('2d');
            canvas5.width = $('#item_3').width();
            canvas5.height = $('#item_3').height();
            ctx5.drawImage(srcImg, 0, 0);
            //                    SaveCanvasImage('Designed_3');
        }
        //        if (checkApprovals() == true) {
        //            //$('#PreviewFrame, #PreviewWrapper').css({ visibility: 'hidden' });
        //        } else {
        //            for (var i = 0; i < items; i++) {
        //                if (selected + 1 >= items) {
        //                    selected = 0;
        //                } else {
        //                    selected++;
        //                }
        //                if (approved[selected] != true) {
        //                    break;
        //                } else {
        //                    continue;
        //                }
        //            }
        //            selectItem();
        //        }
        //        selectItem();
        //$('div.previewItemActions span, #DesignApproval').addClass('ButtonInactive');
        $('div.previewItemActions input').attr('disabled', true);
        $('#MainBtns').addClass('noImage');
        $('#MainBtns .UI-icon').each(function () {
            btnStatus = $(this).attr('class');
            if (!btnStatus.contains('new-image')) {
                btnStatus = btnStatus + '-deactive';
            }
            $(this).attr('class', btnStatus);
        });
        if ($(this).prev('#ShareThis').is(':checked')) {
            $('img.itemImagePreview.' + selected).next().show();
        }
        //        if (checkApprovals() != true) {
        //            $('div.selectImageText').show();
        //        } else {
        //            $('div.selectImageText').hide();
        //            $('div.allDesignsApproved').show();
        //            $('#DesignComplete').removeClass('ButtonInactive');
        //            $('ul.designItems').children().removeClass('selected');
        //        }
    });


    $('#RotateCCW').click(function () {
        if (edit == true) {
            $('#DesignApproval').removeClass('ButtonInactive');
            $('#DesignComplete').addClass('ButtonInactive');
        }
    });

    $("body").delegate('#Library img,#mediaLibrary img', "click", function () {
        if (init == 2) {
            $('#MainCanvas, #PreviewCanvas').remove();
            //alert('Prompt user if they are sure they want to start over with new image.');
            resetCanvas();
        }
        btnStatus = $('#Move .UI-icon').attr('class');
        if (btnStatus.contains('-locked')) {
            btnStatus = btnStatus.replace('-locked', '');
            $('#Move .UI-icon').attr('class', btnStatus);
            $('#Move').addClass('btnSelected');
            $('canvas').draggable('enable');
        }
        $('#PreviewFrame').show();
        $('#mediaLibrary').jqmHide();
        $('div.selectedImage').show();
        $('div.selectImageText').hide();
        $('div.previewItemActions span, #DesignApproval').removeClass('ButtonInactive');
        $('div.previewItemActions input').removeAttr('disabled');
        $('#MainBtns').removeClass('noImage');
        $('#MainBtns .UI-icon').each(function () {
            btnStatus = $(this).attr('class');
            btnStatus = btnStatus.replace('-deactive', '');
            $(this).attr('class', btnStatus);
        });
        $('ul.designItems').addClass('inactive');

        var srcPath = $(this).attr('src');

        canvas = document.createElement('canvas');
        canvasp = document.createElement('canvas');
        if (typeof FlashCanvas != "undefined") {
            FlashCanvas.initElement(canvas);
            FlashCanvas.initElement(canvasp);
        }
        $(canvas).attr('id', 'MainCanvas');
        $(canvasp).attr('id', 'PreviewCanvas');
        ctx = document.getElementById('SelectedImage').appendChild(canvas).getContext('2d');
        ctx2 = document.getElementById('PreviewWrapper').appendChild(canvasp).getContext('2d');
        srcImg.onload = function () {
            draw();
            InitMargin = -1 * (Math.abs((srcImg.height) * Math.sin(45 * Math.PI / 180)) + Math.abs((srcImg.width) * Math.cos(45 * Math.PI / 180)));
            leftM = (InitMargin / -2) + ($('#PreviewFrame').width() / 2);
            leftM2 = (InitMargin / -2) + ($('#DesignCanvas').width() / 2);
            leftT = (InitMargin / -2) + ($('#PreviewFrame').height() / 2);
            leftT2 = (InitMargin / -2) + ($('#DesignCanvas').height() / 2);
            $('div.designPreviewItem canvas, #DesignCanvas canvas').draggable({
                drag: function (event, ui) {
                    var i = $('#DesignCanvas canvas').position();
                    $('#PreviewWrapper canvas').css({
                        left: (leftM - leftM2) + i.left,
                        top: (leftT - leftT2) + i.top
                    });
                }
            });
        };
        srcImg.src = srcPath;
    });

    $('ul.designItems li').click(function () {
        selected = $(this).index();
        selectItem();
        if (approved[selected] == true) {
            edit = true;
        } else {
            edit = false;
        }
        if ($(this).data('approved') === true) {
            $('div.allDesignsApproved, div.selectImageText').hide();
            $('#preview, div.selectedImage').show();
            $('#PreviewFrame, #PreviewWrapper').show().css({ visibility: 'visible' });
            $('div.previewItemActions span').removeClass('ButtonInactive');
            $('div.previewItemActions input').removeAttr('disabled');
            $('#MainBtns').removeClass('noImage');
            $('div.previewItemActions span, #DesignApproval').addClass('ButtonInactive');
            $('#MainBtns .UI-icon').each(function () {
                btnStatus = $(this).attr('class');
                btnStatus = btnStatus.replace('-deactive', '');
                $(this).attr('class', btnStatus);
            });
            $('ul.designItems').addClass('inactive');
        } else {
            $('div.previewItemActions span, #DesignApproval').removeClass('ButtonInactive');
        }
    });

}

var approved = [];
var selected = 0;
var edit = false;
var items = $('ul.designItems li').size();

function selectItem() {
    $('ul.designItems').children().removeClass('selected');
    $('ul.designItems li:eq(' + selected + ')').addClass('selected');
}

//function checkApprovals(s) {
//    if (s != null) {
//        if (approved[s] == true) {
//            return true;
//        } else {
//            return false;
//        }
//    } else {
//        if (approved.length < (items)) {
//            return false;
//        } else {
//            for (var i = 0; i < (items - 1); i++) {
//                if (approved[i] != true) {
//                    return false;
//                }
//            }
//            return true;
//        }
//    }
//}


/***************************
Functions
***************************/
function draw(approved) {
    var nW = $('#PreviewFrame').width();
    var nH = $('#PreviewFrame').height();
    var dcW = $('#DesignCanvas').width();
    var dcH = $('#DesignCanvas').height();
    var siW = srcImg.width;
    var siH = srcImg.height;
    var nW2 = nW / 2;
    var nH2 = nH / 2;
    var dcW2 = dcW / 2;
    var dcH2 = dcH / 2;
    var siW2 = siW / 2;
    var siH2 = siH / 2;
    var rad = deg * Math.PI / 180;
    var constantRad = 45 * Math.PI / 180;
    var fx;
    var fy;
    var newSiW = Math.abs((siH) * Math.sin(constantRad)) + Math.abs((siW) * Math.cos(constantRad));
    var newSiH = Math.abs((siH) * Math.cos(constantRad)) + Math.abs((siW) * Math.sin(constantRad));
    var newSiW2 = newSiW / 2;
    var newSiH2 = newSiH / 2;
    fx = 1;
    fy = 1;
    if (flipx) {
        fx = -1 * fx;
    }
    if (flipy) {
        fy = -1 * fy;
    }
    if (approved == true) {
        $('#PreviewCanvas').css({ 'left': '0', 'top': '0' });
        var cPos = $('#MainCanvas').position();
        canvasp.width = $('#PreviewFrame').width();
        canvasp.height = $('#PreviewFrame').height();
        if (checkBrowser()) {
            ctx2.drawImage(canvas, (canvas.width / -2) + nW2 - ((-newSiW2 + dcW2) - cPos.left), (canvas.height / -2) + nH2 - ((-newSiH2 + dcH2) - cPos.top), canvas.width, canvas.height);
            ctx2.drawImage(document.getElementById('PreviewFrame'), 0, 0);
        } else {
            ctx2.save();
            ctx2.scale(fy, fx);
            ctx2.translate((-siW2 * scale) + (nW2 * fy), (-siH2 * scale) + (nH2 * fx));
            ctx2.save();
            ctx2.translate(-((-newSiW2 + dcW2) - cPos.left), -((-newSiH2 + dcH2) - cPos.top));
            ctx2.translate(siW2 * scale, siH2 * scale);
            ctx2.rotate(rad);
            ctx2.translate(-siW2 * scale, -siH2 * scale);
            ctx2.drawImage(srcImg, 0, 0, siW * scale, siH * scale);
            ctx2.restore();
            ctx2.scale(fy, fx);
            //ctx2.translate((-newSiW2 + dcW2) - cPos.left, (-newSiH2 + dcH2) - cPos.top);
            ctx2.drawImage(document.getElementById('PreviewFrame'), (siW2 * scale * fy) - nW2, (siH2 * scale * fx) - nH2);
        }
    } else {
        canvas.setAttribute('width', newSiW);
        canvas.setAttribute('height', newSiH);
        canvasp.setAttribute('width', newSiW);
        canvasp.setAttribute('height', newSiH);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var perc = 1;
        if (init == 1) {
            if (siW > dcW || siH > dcH) {
                if ((dcW / siW) < (dcH / siH)) {
                    perc = dcW / siW;
                } else {
                    perc = dcH / siH;
                }
                scale = scale * perc;
                $('#Size .ui-slider-handle').css('bottom', (100 * perc + '%'));
            }
            $(canvas).css({ 'left': (-newSiW2 + dcW2) + 'px', 'top': (-newSiH2 + dcH2) + 'px' });
            $(canvasp).css({ 'left': (-newSiW2 + nW2) + 'px', 'top': (-newSiH2 + nH2) + 'px' });

            init = 2;
        }

        ctx.translate(newSiW2 - (siW2 * scale * fy), newSiH2 - (siH2 * scale * fx));
        ctx.scale(fy, fx);
        ctx.translate(siW2 * scale, siH2 * scale);
        ctx.rotate(rad);
        ctx.translate(-siW2 * scale, -siH2 * scale);
        ctx.drawImage(srcImg, 0, 0, siW * scale, siH * scale);
        ctx.restore();
        ctx2.save();
        ctx2.translate(newSiW2 - (siW2 * scale * fy), newSiH2 - (siH2 * scale * fx));
        ctx2.save();
        ctx2.scale(fy, fx);
        ctx2.translate(siW2 * scale, siH2 * scale);
        ctx2.rotate(rad);
        ctx2.translate(-siW2 * scale, -siH2 * scale);
        ctx2.drawImage(srcImg, 0, 0, siW * scale, siH * scale);
        ctx2.restore();

        if (newLightenVal != 0) {
            brightness(newLightenVal);
        }
        if (checkBrowser()) {
            if ($('#Desaturate').hasClass('btnSelected')) {
                desat();
            }
        }
    }
}

function checkBrowser() {
    if (!$.browser.msie || ($.browser.msie && parseInt($.browser.version) > 8)) {
        return true;
    } else {
        return false;
    }
}

function brightness(amount) {
    amount = Math.max(-1, Math.min(1, amount));
    var mul = amount + 1;
    if (checkBrowser()) {
        var imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (var y = 0; y < imgPixels.height; y++) {
            for (var x = 0; x < imgPixels.width; x++) {
                var i = (y * 4) * imgPixels.width + x * 4;
                if ((imgPixels.data[i] = imgPixels.data[i] * mul) > 255)
                    imgPixels.data[i] = 255;
                if ((imgPixels.data[i + 1] = imgPixels.data[i + 1] * mul) > 255)
                    imgPixels.data[i + 1] = 255;
                if ((imgPixels.data[i + 2] = imgPixels.data[i + 2] * mul) > 255)
                    imgPixels.data[i + 2] = 255;
            }
        }
        ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
        ctx2.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
    } else {
        if ($('#Desaturate').hasClass('btnSelected')) {
            $('#PreviewCanvas, #MainCanvas').css({ filter: 'gray' });
            $('#PreviewCanvas, #MainCanvas').css({ filter: 'gray light()' });
        } else {
            $('#PreviewCanvas, #MainCanvas').css({ filter: 'none' });
            $('#PreviewCanvas, #MainCanvas').css({ filter: 'light()' });
        }
        var img = document.getElementById("PreviewCanvas");
        var img2 = document.getElementById("MainCanvas");
        img.filters.light.addAmbient(255, 255, 255, 100);
        img2.filters.light.addAmbient(255, 255, 255, 100);
        img.filters.light.addAmbient(255, 255, 255, 100 * amount);
        img2.filters.light.addAmbient(255, 255, 255, 100 * amount);
    }
}

function desat() {
    if (checkBrowser()) {
        var imgPixels = ctx.getImageData(0, 0, canvasp.width, canvasp.height);
        for (var y = 0; y < imgPixels.height; y++) {
            for (var x = 0; x < imgPixels.width; x++) {
                var i = (y * 4) * imgPixels.width + x * 4;
                var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
                imgPixels.data[i] = avg;
                imgPixels.data[i + 1] = avg;
                imgPixels.data[i + 2] = avg;
            }
        }
        ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
        ctx2.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
    } else {
        if ($(this).hasClass('btnSelected')) {
            $('canvas').filters.gray.enabled = false;
        } else {
            $('canvas').filters.gray.enabled = true;
        }
    }
}

function resetCanvas() {
    if (checkBrowser()) {
        $('#Lighten .ui-slider-handle').css('bottom', '50%');
    } else {
        $('#Lighten .ui-slider-handle').css('bottom', '0%');
    }
    $('#Size .ui-slider-handle').css('bottom', '100%');
    $('a.btnToolBar').removeClass('btnSelected');
    if (!$('a.move').hasClass('locked')) {
        $('a.move').addClass('btnSelected');
    }
    $('#MainCanvas').css('left', '0');
    scale = 1;
    init = 1;
    flipx = false;
    flipy = false;
    deg = 0;
    newLightenVal = 0;
    $('#PreviewCanvas, #MainCanvas').css({ filter: 'none' });
}


function allApproved(isApproved) {
    if (isApproved) {
        $('div.selectImageText').hide();
        $('div.allDesignsApproved').show();
        //$('#DesignComplete').removeClass('ButtonInactive');
        $('#novellaDesignItems_UL').children().removeClass('selected');
        $('#PreviewFrame, #PreviewWrapper').css({ visibility: 'hidden' });
    }
}

//Set current selected li novella to true or false.
function setSelectedNovella(val) {
    $('#novellaDesignItems_UL').children('.selected').data('approved', val);
}
//Removes the selected class from all shown novellas.
//Sets the passed in novella item to the current selected.
function selectTheNextUnapprovedNovella(li) {
    $('#novellaDesignItems_UL').children().removeClass('selected');
    li.addClass('selected');
}
//Checks all the novellas to see if they are approved or not.
function checkApprovals() {
    var allTrue = true;
    $('#novellaDesignItems_UL').children('li').each(function () {
        var isApproved = $(this).data('approved');
        if (isApproved !== true) {
            selectTheNextUnapprovedNovella($(this));
            $('div.selectImageText').show();
            $('div.allDesignsApproved').hide();
            allTrue = false;
            return false;
        }
    });
    return allTrue;
}

