
/*

4/16/2012
Changed how events are wired up, now any time a canvas with an id starting with MainCanvas gets created it will get auto wired to any subscribed events

Goals:
Get a set canvas size and elimate all logic that is made obsolete by this change

List of functions to get rid of:


4/15/2012
Summary of changes:
added canvasDrawApi
init is called by the onDesignInit function once it is finished, since this was the main entry point we had to wait for it to complete first
subscribe is how you can hook up listeners, it will determine imageInfo with degree and scale and pass that information to the handler you register

Example usage
canvasDrawApi.subscribe('mousedown', function (evt, imageInfo) {
console.log('mousedown');
});

canvasDrawApi.subscribe('mouseup', function (evt, imageInfo) {
console.log('mouseup');
});

canvasDrawApi.subscribe('mousemove', function (evt, imageInfo) {
console.log('mousemove');
});


Moved several canvasRender methods to prototype in preparation for refactor of novellaCanvas/canvasRender

refactored differences in brightness, desaturate, and addnoise
added manipulateImageData function to get image data, call all functions that are interseted in modifying the data, then putting it
so that we only get and put once for the entire redraw instead of once per function (brightness, desaturate, addnoise)

*/
MyCurrentCanvasCallBacks = {};
MyCurrentCanvasCallBacks.isProcessing = false;

var canvasDrawApi = (function () {
    var registry = {},
        canvasInfoHandler = function (evt) {
          var selectedCanvas = getSelectedCanvas(),
              imageSource = selectedCanvas.src,
              handlers = registry[evt.type],
              imageInfo;

          if (imageSource && typeof imageSource === 'object') {
              imageInfo = getImgInfo(imageSource);
              imageInfo.scale = selectedCanvas.scale;
              imageInfo.degree = selectedCanvas.degree;
              $.each(handlers, function (index, handler) {
                  handler(evt, imageInfo);
              });
          }
        },
        api;

    api = {
        wireEventsTo: function (element) {
            var eventName;
            for (eventName in registry) {
                if (registry.hasOwnProperty(eventName)) {
                    element.addEventListener(eventName, canvasInfoHandler);
                }
            }
        },
        subscribe: function (eventName, eventHandler) {
            if (registry.hasOwnProperty(eventName)) {
                registry[eventName].push(eventHandler);
            } else {
                registry[eventName] = [eventHandler];
            }
        }
    };
    return api;
} ());



function mainButtonsUI(hasImage) {
    var getClassName;
    if (hasImage) {
        $('#MainBtns').removeClass('noImage');
        getClassName = activate;
    }
    else {
        $('#MainBtns').addClass('noImage');
        getClassName = deactivate;
    }

    $('#MainBtns .UI-icon').each(function () {
        var btnStatus = $(this).attr('class');
        btnStatus = getClassName(btnStatus);
        if (!$(this).hasClass(btnStatus)) {
            $(this).attr('class', btnStatus);
        }
    });

    function activate(currentClass) {
        return currentClass.replace('-deactive', '');
    }

    function deactivate(currentClass) {
        if (currentClass.indexOf('-deactive') > 0) {
            return currentClass;
        }
        else {
            return currentClass + '-deactive';
        }
    }
}


function replacePreviewNovellaAfterApproval() {
    var $selectedImages = $('#novellaDesignItems_UL .selected img'),
    myCanvas = getSelectedCanvas();

    if ($selectedImages.length == 4 || $selectedImages.length == 2) {
        $selectedImages.last().remove();
    }
    else if ($selectedImages.length == 3) {
        $selectedImages.filter('img:nth-child(2)').hide();
    }

    if (myCanvas.isApproved) {
        var height = $selectedImages.height(),
            width = $selectedImages.width(),
            orderItemId = $selectedImages.parents("li").attr("id");

        SaveCanvasImage('PreviewCanvas' + myCanvas.index, 'PreviewImageFilePath', orderItemId, null, null);

        var img = $('#PreviewCanvas' + myCanvas.index)[0].toDataURL("image/png");
        $('#novellaDesignItems_UL .selected').append('<img height="' + height + '" width="' + width + '" src="' + img + '"/>');
        $selectedImages.first().hide();
    }
    else {
        $selectedImages.first().show();
    }
}


function calcNewLocationLength(originLength, currentLength, scale) {
    var difference = Math.abs(originLength - currentLength);
    var differenceScaled = difference / scale;
    var minuend = originLength > currentLength ? originLength : -originLength;
    var newLength = minuend - differenceScaled;
    return newLength;
}

function onDesignInit() {
    initializeMainAndPreviewCanvas();
    addNovellaCanvas();
    //Save Progress
    $('#btnSaveProgress').click(function () {
        if (!$('#btnSaveProgress').hasClass('ButtonInactive')) {
            var myCanvas = getSelectedCanvas();
            if (typeof myCanvas !== "undefined") {
                var index = myCanvas.index,
                selectedLi = $('#novellaDesignItems_UL .selected'),
                frame = selectedLi.data('frame'),
                orderItemId = selectedLi.attr("id"),
                previousScale = myCanvas.scale,
                mainId = 'MainCanvas' + index,
                previewId = 'PreviewCanvas' + index,
                thumbnail = selectedLi.children("img").first(),
                height = thumbnail.height(),
                width = thumbnail.width(),
                imgInfo = getImgInfo(myCanvas.src);


                if ($('#' + mainId).length < 1) {
                    thumbnail.hide();
                    removeAndRename(previewId, 'PreviewCanvas', 'PreviewWrapper');
                    removeAndRename(mainId, 'MainCanvas', 'SelectedImage');
                    $('#MainCanvas').hide();
                    tryToPositionMargins(index);
                } else {
                    selectedLi.children("img:visible").remove();
                }
                var offSet = getPreviewOffSet(index);

                declareCallBackInitalizer(true, 2);

                var newCanvas = createNewCanvasToSave('tempPreviewCanvas', frame.width, frame.height);
                var newCanvasContext = newCanvas.getContext('2d');

                newCanvasContext.drawImage($('#' + previewId)[0], (offSet.left * -1), (offSet.top * -1), frame.width, frame.height, 0, 0, frame.width, frame.height);
                $(newCanvas).appendTo(selectedLi);
                newCanvasContext.drawImage(document.getElementById('PreviewFrame'), 0, 0);
                SaveCanvasImage("tempPreviewCanvas", 'PreviewImageFilePath', orderItemId, null, null);

                myCanvas.scale = 1;
                myCanvas.reDrawImage();

                var mainCanvasSize = getMainCanvasSize(imgInfo, myCanvas),
                mainCanvas = createNewCanvasToSave('', mainCanvasSize.dw, mainCanvasSize.dh),
                mainContext = mainCanvas.getContext('2d');

                if (mainCanvasSize.dw === imgInfo.canvasWidth && mainCanvasSize.dh === imgInfo.canvasHeight) {
                    mainContext.drawImage($('#' + mainId)[0], 0, 0);
                } else {
                    mainContext.drawImage($('#' + mainId)[0], mainCanvasSize.dx, mainCanvasSize.dy, mainCanvasSize.dw, mainCanvasSize.dh, 0, 0, mainCanvasSize.dw, mainCanvasSize.dh);
                }
                SaveCanvasImage('', "MainCanvasFilePath", orderItemId, mainCanvas);

                myCanvas.scale = previousScale;
                myCanvas.reDrawImage();

                var img = $("#tempPreviewCanvas")[0].toDataURL("image/png");
                $("#tempPreviewCanvas").remove();
                selectedLi.append('<img height="' + height + '" width="' + width + '" src="' + img + '"/>');
            }
        }
    });

    //Reset  Image
    $('#ResetPic').click(function () {
        if (!canvasIsProcessing()) {
            canvasBeginProcessing();
            var myCanvas = getSelectedCanvas();
            if (myCanvas.src != undefined && myCanvas.src != null) {
                var bottomPercentage = checkBrowser() ? '50%' : '0%';
                putInEditMode(myCanvas);

                inEditMode();

                $('#Lighten .ui-slider-handle').css('bottom', bottomPercentage);
                $('a.btnToolBar').removeClass('btnSelected');

                if (!$('a.move').hasClass('locked')) {
                    $('a.move').addClass('btnSelected');
                }
                $('#PreviewCanvas, #MainCanvas').css({ filter: 'none' });

                myCanvas.reset();
                myCanvas.addImageDraw(myCanvas.srcPath);
                $('#Size .ui-slider-handle').css('bottom', (myCanvas.scale * 100 + '%'));
            }
        }
    });

    $('#DesignComplete').click(function () {
        if (!canvasIsProcessing()) {
            canvasBeginProcessing();
            if ($('#DesignComplete').hasClass('ButtonInactive') == false)
                if (allApproved || allNovellasHasPreviews()) {
                    $('#PleaseWaitWhileWePrepareYourItemsForReview').show();
                    $('#savingNovellasInProgress').jqmShow();

                    var orderItemId = $('#OrderItemID').val();
                    var bundleGuid = $('#BundleID').val();
                    var productId = $('#ProductID').val();

                    $.get('/Design/PreviewWindow', { Id: productId, bundleGuid: bundleGuid, orderItemId: orderItemId }, function (data) {
                        $('#PreviewDesign').html(data);
                        $('#PreviewDesign').jqmShow();
                        $('#savingNovellasInProgress div').children().hide();
                        $('#savingNovellasInProgress').jqmHide();
                    }, 'html');
                }
        }
    });

    $('#Move').click(function () {

        if (!canvasIsProcessing()) {
            canvasBeginProcessing();
            var myCanvas = getSelectedCanvas();
            if (myCanvas.src != undefined && myCanvas.src != null) {
                putInEditMode(myCanvas);
            }
        }
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

    var val = 50;
    var m = 0;
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
            var newLightenVal = ((ui.value / 100 * 2) - 1).toFixed(2);
            $("#lightenVal").val(newLightenVal);

            if (newLightenVal == 0) {
                $('#Light').removeClass('btnSelected');
            } else {
                $('#Light').addClass('btnSelected');
            }
            var novella = getSelectedCanvas();
            if (novella.src != undefined && novella.src != null) {
                putInEditMode(novella);
                novella.lightenVal = newLightenVal;
                novella.reDrawImage();
            }
        },
        value: val,
        step: 5
    });
    /***** End Lighten *****/

    /***** Start Size Image *****/
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
        min: 0,
        max: 100,
        slide: function (event, ui) {
            resizeCanvas(ui.value);
        },
        value: 50,
        step: 1
    });
    /***** End Size Image *****/

    /***** Start Rotate Image *****/
    $('a.rotator').click(function () {
        if (!canvasIsProcessing()) {
            canvasBeginProcessing();
            var novella = getSelectedCanvas();
            if (novella.src != undefined && novella.src != null) {
                putInEditMode(novella);
                novella.rotateImage($(this).attr('rel'));
            }
        }
    });
    /***** End Rotate Image *****/

    /***** Start Flip Image *****/
    $('a.flip').click(function () {
        if (!canvasIsProcessing()) {
            canvasBeginProcessing();
            var $this = $(this),
            selectedClass = 'btnSelected',
            currentCanvas = getSelectedCanvas(),
            isHorizontal = $this.hasClass('horizontal'),
            isVertical = $this.hasClass('vertical');
            if (currentCanvas.src != undefined && currentCanvas.src != null) {
                if ($this.hasClass(selectedClass)) {
                    $this.removeClass(selectedClass);
                } else {
                    $this.addClass(selectedClass);
                }
                putInEditMode(currentCanvas);
                currentCanvas.needsToFlipY = isVertical;
                currentCanvas.needsToFlipX = isHorizontal;
                if (isHorizontal) {
                    currentCanvas.isFlipX = !currentCanvas.isFlipX;
                }
                if (isVertical) {
                    currentCanvas.isFlipY = !currentCanvas.isFlipY;
                }
                currentCanvas.reDrawImage();
            }
        }
    });
    /***** End Flip Image *****/
    $('#Desaturate').click(function () {
        if (!canvasIsProcessing()) {
            canvasBeginProcessing();
            var currentCanvas = getSelectedCanvas();
            if (currentCanvas.src != undefined && currentCanvas.src != null) {
                putInEditMode(currentCanvas);
                currentCanvas.isDesat = !currentCanvas.isDesat;
                currentCanvas.reDrawImage();
            }
        }
    });

    //Clicking an image
    $("body").delegate('#Library img,#mediaLibrary img', "click", function () {

        var btnStatus = $('#Move .UI-icon').attr('class'),
            theSrcImg = $(this).parent().find('input:hidden').val();
        //           theSrcImg = $(this).attr('src');
        if (btnStatus.contains('-locked')) {
            btnStatus = btnStatus.replace('-locked', '');
            $('#Move .UI-icon').attr('class', btnStatus);
            $('#Move').addClass('btnSelected');
            $('#PreviewCanvas, #MainCanvas').draggable('enable');
        }
        $('div.selectImageText').hide();
        $('#PreviewFrame, #SelectedImage').show();
        $('#mediaLibrary').jqmHide();
        $('#DesignApproval').removeClass('ButtonInactive');
        $('div.previewItemActions input').removeAttr('disabled');
        $('ul.designItems').addClass('inactive');
        mainButtonsUI(true);

        //Decide to make a new one or to load a prior one.        
        var myCanvas = getSelectedCanvas();
        if (myCanvas != undefined && myCanvas.isApproved) {
            $('#loseAllChangesRestart').data('imgSrc', theSrcImg);
            $('#ChangesLost').jqmShow();
        }
        else {
            approvalBind();
            myCanvas.addImageDraw(theSrcImg);
        }
    });

    $('#loseAllChangesRestart').click(function () {
        var index = getSelectedCanvas().index;
        $('ul.designItems li.selected').data('novellaCanvas', new novellaCanvas(false, false, false, 0, 1, index));
        $('#PreviewCanvas, #MainCanvas, #PreviewFrame').show();
        $('#MainCanvas' + index).remove();
        $('#PreviewCanvas' + index).remove();
        removeImage();
        $('#DesignApproval').removeClass('ButtonInactive');
        $('ul.designItems li.selected').data('novellaCanvas').addImageDraw($('#loseAllChangesRestart').data('imgSrc'));
        approvalBind();
        $('#DesignComplete').addClass('ButtonInactive');
        $('#loseAllChangesRestart').data('imgSrc', null);
        $('#ChangesLost').jqmHide();
        replacePreviewNovellaAfterApproval();
        $('.designPreviewItem').children('img[id^="previewAsset"]').remove();
    });

    //**Clicking a Novella**//
    $('ul.designItems li').click(function () {

        var previous = getSelectedCanvas();
        if (previous != undefined && previous.isApproved) {
            previous.isEditing = false;
        }

        $('ul.designItems').children().removeClass('selected');
        var currentLi = $(this),
        currentCanvas = $(this).data('novellaCanvas');
        currentLi.addClass('selected');
        $('.designPreviewItem').children('img[id^="previewAsset"]').remove();

        previewRatioAndWrap(currentLi.children("img").first().attr("src"), currentLi, currentCanvas);

    });
}

function clickingNovellaLi(currentLi, currentCanvas) {
    updateCanvas(currentLi, currentCanvas);
    showSelectedCanvas(currentLi);
    $('div.selectImageText').hide();
    if (currentCanvas.isApproved) {
        $('div.allDesignsApproved').hide();
        $('#preview, div.selectedImage').show();
        $('#PreviewFrame, #PreviewWrapper').show().css({ visibility: 'visible' });
        $('div.previewItemActions span').removeClass('ButtonInactive');
        $('div.previewItemActions input').removeAttr('disabled');
        $('#MainBtns').removeClass('noImage');
        $('#DesignApproval').addClass('ButtonInactive');
        $('#MainBtns .UI-icon').each(function () {
            var btnStatus = currentLi.attr('class');
            btnStatus = btnStatus.replace('-deactive', '');
            currentLi.attr('class', btnStatus);
        });
        $('.icon-move').removeClass('icon-move').addClass('icon-move-locked');
        $('ul.designItems').addClass('inactive');
        $('#DesignApproval').unbind('click', doNovellaApproved);
        $('#Size .ui-slider-handle').css('bottom', currentCanvas.scale * 100 + '%');

    }
    else {
        if (currentCanvas.src == undefined || currentCanvas.src == null) {
            $('div.selectImageText').show();
            $('#DesignApproval').unbind('click', doNovellaApproved);
            $('#DesignApproval').addClass('ButtonInactive');
            mainButtonsUI(false);
        }
        else {
            $('#DesignApproval').removeClass('ButtonInactive');
            approvalBind();
            mainButtonsUI(true);
        }
    }
    if (checkApprovals() || allNovellasHasPreviews()) {
        $('#DesignComplete').removeClass('ButtonInactive');
    }

    if (currentLi.find('input:hidden[name="IsEditing"]').val() === 'False') {
        $('#btnSaveProgress').addClass('ButtonInactive');
    } else {
        $('#btnSaveProgress').removeClass('ButtonInactive');
    }
}

/***************************
Functions
***************************/
function inEditMode() {
    //Hide all saved canvases.
    $('#SelectedImage').find('canvas').hide();
    $('#PreviewWrapper').find('canvas').hide();

    //Show the editing canvases
    $('#PreviewCanvas, #PreviewFrame, #MainCanvas').show();
    removeImage();

    $('#Move').children('.UI-icon').removeClass('icon-move-locked').addClass('icon-move');
    $('#DesignApproval').removeClass('ButtonInactive');
}

function putInEditMode(theCanvas) {
    if (theCanvas.isApproved && !theCanvas.isEditing) {
        removeImage();
        reDrawNovellaCanvas();
        approvalBind();
        $('#Move').children('.UI-icon').removeClass('icon-move-locked').addClass('icon-move');
        theCanvas.isEditing = true;
        $('#DesignApproval').removeClass('ButtonInactive');
        $('#DesignComplete').addClass('ButtonInactive');
        approvalBind();
        $('.designPreviewItem').children('img[id^="previewAsset"]').remove();
        mainButtonsUI(true);
    }
}

function resizeCanvas(val) {
    var novella = getSelectedCanvas();
    if (novella.src != undefined && novella.src != null) {
        putInEditMode(novella);
        novella.scale = (val / 100).toFixed(2);
        novella.reDrawImage();
    }
}

function approvalBind() {
    $('#DesignApproval').unbind('click', doNovellaApproved); //prevent double binding    
    $('#DesignApproval').bind('click', doNovellaApproved);
}

function ensureCanvas(canvas) {
    if (typeof FlashCanvas != "undefined") {
        FlashCanvas.initElement(canvas);
    }
}

var doNovellaApproved = function () {
    $('#DesignApproval').addClass('ButtonInactive');

    $('#PleaseWaitWhileWeUploadYourFiles').show();
    $('#savingNovellasInProgress').jqmShow();

    var api = new MyRequestsCompleted({
        numRequest: 3,
        singleCallBack: function () {
            $('#savingNovellasInProgress div').children().hide();
            $('#savingNovellasInProgress').jqmHide();
            selectNextUnapprove();
        }
    });

    MyCurrentCanvasCallBacks.rc = api;

    var selectedLi = $('#novellaDesignItems_UL li.selected'),
        myCanvas = getSelectedCanvas(),
        index = myCanvas.index,
        offSet = getPreviewOffSet(),
        mainId = 'MainCanvas' + index,
        previewId = 'PreviewCanvas' + index,
        frame = selectedLi.data('frame'),
        imgInfo = getImgInfo(myCanvas.src);

    selectedLi.find('input:hidden[name="MainPreviewPath"]').remove();
    selectedLi.children('img[id^="previewAsset"]').remove();
    selectedLi.find('input:hidden[name="IsEditing"]').val("False");

    var previewFrame, contextPreviewFrame;

    if ($('#' + previewId).is(':visible')) {
        offSet = getPreviewOffSet(index);
        previewFrame = createNewCanvasToSave(previewId, frame.width, frame.height);
        contextPreviewFrame = previewFrame.getContext('2d');
        contextPreviewFrame.drawImage($('#' + previewId)[0], (offSet.left * -1), (offSet.top * -1), frame.width, frame.height, 0, 0, frame.width, frame.height);
        SaveFulFillmentAsset(myCanvas, frame, imgInfo, offSet, selectedLi, '#' + mainId);

        $('#' + previewId).remove();
        $(previewFrame).appendTo('#PreviewWrapper');
        contextPreviewFrame.drawImage(document.getElementById('PreviewFrame'), 0, 0);
    } else {
        $('#' + previewId).remove();
        previewFrame = createNewCanvasToSave(previewId, frame.width, frame.height);
        contextPreviewFrame = previewFrame.getContext('2d');
        contextPreviewFrame.drawImage($('#PreviewCanvas')[0], Math.abs(offSet.left), Math.abs(offSet.top), frame.width, frame.height, 0, 0, frame.width, frame.height);
        SaveFulFillmentAsset(myCanvas, frame, imgInfo, offSet, selectedLi);

        $(previewFrame).appendTo('#PreviewWrapper');
        contextPreviewFrame.drawImage(document.getElementById('PreviewFrame'), 0, 0);
        removeAndRename(mainId, 'MainCanvas', 'SelectedImage');
    }

    $('#PreviewFrame, #PreviewCanvas').hide();
    $('#' + previewId + ', #' + mainId).draggable("disable");

    if ($('#MainCanvas').length == 0) {
        createCanvasAppendTo('MainCanvas', 'SelectedImage');
    }
    myCanvas.isApproved = true;
    myCanvas.isEditing = false;
    $('.icon-move').removeClass('icon-move').addClass('icon-move-locked');
    $('#DesignApproval').unbind('click', doNovellaApproved);
    replacePreviewNovellaAfterApproval();
    allApproved(checkApprovals());
};


function canFit(boundingBox, sourceBox) {
    return boundingBox.width >= sourceBox.width && boundingBox.height >= sourceBox.height;
}

function determineScale(boundingBox, sourceBox) {

    if (canFit(boundingBox, sourceBox)) {
        return 1;
    }
    else {
        return determineScaleFactor(boundingBox, sourceBox);
    }
}

function determineScaleFactor(boundingBox, sourceBox) {
    var widthScale = boundingBox.width / sourceBox.width;
    var heightScale = boundingBox.height / sourceBox.height;
    return (widthScale < heightScale) ? widthScale : heightScale;
}


function addNovellaCanvas() {
    $('ul.designItems li').each(function (index) {
        $(this).data('novellaCanvas', new novellaCanvas(false, false, false, 0, 1, index));
    });
}

function getSelectedCanvas() {
    return $('ul.designItems li.selected').data('novellaCanvas');
}


function reDrawNovellaCanvas() {
    var select = getSelectedCanvas(),
        index = select.index,
        scale = select.scale,
        main = $("#MainCanvas" + index),
        mainLeft = main.css("left"),
        mainTop = main.css("top"),
        preview = $("#PreviewCanvas" + index),
        imgInfo = getImgInfo(select.src);

    preview.hide();
    main.hide();

    $('#PreviewCanvas, #PreviewFrame, #MainCanvas').show();

    setHWforCanvasDraw($('#MainCanvas')[0], imgInfo.canvasWidth, imgInfo.canvasHeight);
    setHWforCanvasDraw($('#PreviewCanvas')[0], imgInfo.canvasWidth, imgInfo.canvasHeight);
    $('#MainCanvas').css({ left: mainLeft, top: mainTop, position: 'absolute' });
    select.needsToFlipX = select.isFlipX;
    select.needsToFlipY = select.isFlipY;
    select.scale = scale;
    select.reDrawImage();
    tryToPositionMargins();
}


function getPreviewOffSet(index) {
    var previewName = getCanvasName('#PreviewCanvas', index),
        mainName = getCanvasName('#MainCanvas', index),
        mainBasePosition = getBasePosition('#DesignCanvas', mainName),
        previewBasePosition = getBasePosition('#PreviewWrapper', previewName);

    var position = $('#DesignCanvas ' + mainName).position(),
                leftDifference = position.left - mainBasePosition.left,
                topDifference = position.top - mainBasePosition.top,
                newLeft = previewBasePosition.left + leftDifference,
                newTop = previewBasePosition.top + topDifference;

    return { left: newLeft, top: newTop };
}

function positionPreview(index) {
    var offSet = getPreviewOffSet(index),
        previewName = getCanvasName('#PreviewCanvas', index);

    $('#PreviewWrapper ' + previewName).css({
        left: offSet.left,
        top: offSet.top
    });
}


function tryToPositionMargins(index) {
    var noIndex = typeof index === "undefined",
        canvasNames = [
            getCanvasName('#PreviewCanvas', index),
            getCanvasName('#MainCanvas', index)
        ],
        selector = canvasNames.join(',');

    positionPreview(index);

    $(selector).draggable({
        drag: function (event, ui) {
            positionPreview(index);
        }
    });
}

function getCanvasName(name, index) {
    var value = typeof index === "undefined" ? "" : index;
    return name + value;
}

function centerCanvasMain(index) {
    var mainid = getCanvasName('#MainCanvas', index);
    var $mainCanvas = $(mainid),
        $canvasContainer = $('#DesignCanvas'),
        left = ($canvasContainer.width() - $mainCanvas.width()) / 2,
        top = ($canvasContainer.height() - $mainCanvas.height()) / 2;
    $mainCanvas.css({ left: left, top: top, position: 'absolute' });
}


function removeAndRename(canvasId, baseId, containerToAppendId) {
    if ($('#' + canvasId).length > 0) {
        $('#' + canvasId).remove();
    }

    $('#' + baseId).attr('id', canvasId);
    createCanvasAppendTo(baseId, containerToAppendId);
}

function createCanvasAppendTo(canvasToCreateId, containerToAppendId) {
    var shouldWireEvents = /^MainCanvas/.test(canvasToCreateId),
        canvas = document.createElement('canvas');
    ensureCanvas(canvas);
    document.getElementById(containerToAppendId).appendChild(canvas);
    $(canvas).attr('id', canvasToCreateId);
    if (shouldWireEvents) {
      canvasDrawApi.wireEventsTo(canvas);
    }
}


function showSelectedCanvas(current) {
    //Remove preview canvas/image if any
    //reset both preview and main canvas
    var canvasInfo = getSelectedCanvas(),
        index = canvasInfo.index,
        mainId = '#MainCanvas' + index,
        previewId = '#PreviewCanvas' + index;
    if (current.find('input:hidden[name="IsSharedVal"]').val() === "false") {
        $('#ShareThis').removeAttr('checked');
    } else {
        $('#ShareThis').attr('checked', 'checked');
    }

    inEditMode();

    if ($(mainId).length > 0) {
        $('#PreviewCanvas, #MainCanvas').hide();
        $(mainId + ',' + previewId).show();
        if (!canvasInfo.isEditing) {
            $('#PreviewFrame').hide();
        }
    }

    if (canvasInfo.showAsset === true && canvasInfo.isEditing === false) {
        $(previewId).hide();
    } else {
        $('.designPreviewItem').children('img[id^="previewAsset"]').remove();
    }

}

function initializeMainAndPreviewCanvas() {
    createCanvasAppendTo('MainCanvas', 'SelectedImage');
    createCanvasAppendTo('PreviewCanvas', 'PreviewWrapper');

    var $designItemFirst = $('ul.designItems').children(':first');
    if ($designItemFirst.length > 0) {
        $('ul.designItems').children(':first').addClass('selected');
        if ($designItemFirst.children("img").length > 0) {
            previewRatioAndWrap($designItemFirst.children("img").attr("src"), $designItemFirst, getSelectedCanvas());
        }
    }
}

//Get frame ratio and fit the wrapping div to the correct size
function previewRatioAndWrap(theSrc) {
    $('<img/>').load(function () {
        var pic_real_width = this.width,
            pic_real_height = this.height,
            frameDifference = ($('div.designPreview .brdr').width() - pic_real_width) / 2;
        $('div.designPreviewItem').css({ 'margin-left': frameDifference });
        $('#PreviewWrapper').width(pic_real_width).height(pic_real_height);
        $('ul.designItems li.selected').data('frame', { width: pic_real_width, height: pic_real_height });
        clickingNovellaLi($('ul.designItems li.selected'), getSelectedCanvas());
    }).attr("src", theSrc);

    $("#PreviewFrame").attr("src", theSrc);
}

function checkBrowser() {
    if (!$.browser.msie || ($.browser.msie && parseInt($.browser.version) > 8)) {
        return true;
    } else {
        return false;
    }
}

function removeImage() {
    $('#PreviewCanvas, #MainCanvas').each(function () {
        var ctx = this.getContext('2d'),
            width = this.width,
            height = this.height;
        ctx.clearRect(0, 0, width, height);
    });
}

function allApproved(isApproved) {
    saveIsApprovedFlag(isApproved);
    if (isApproved) {
        $('div.selectImageText').hide();
        $('div.allDesignsApproved').show();
        $('#DesignComplete').removeClass('ButtonInactive');
        $('#novellaDesignItems_UL').children().removeClass('selected');
        $('#SelectedImage').find('canvas').hide();
        $('#PreviewWrapper').find('canvas').hide();
        $('input[name="DesignApproved"]').val('True');
    } else {
        $('input[name="DesignApproved"]').val('False');
    }
}

//Set current selected li novella to true or false.
function setSelectedNovella(val) {
    var current = $('#novellaDesignItems_UL').children('.selected').data('novellaCanvas');
    current.isApproved = val;
    $('#novellaDesignItems_UL').children('.selected').data('novellaCanvas', current);
}

//Checks all the novellas to see if they are approved or not.
function checkApprovals() {
    var allTrue = true;
    $('#novellaDesignItems_UL').children('li').each(function () {
        if ($(this).data('novellaCanvas').isApproved != true || $(this).data('novellaCanvas').isEditing) {
            $('div.allDesignsApproved').hide();
            allTrue = false;
            return false;
        }
    });
    return allTrue;
}


function getCanvasInfo(canvasId) {
    var main = $('#' + canvasId)[0];
    return {
        context: main.getContext('2d'),
        halfWidth: main.width / 2,
        halfHeight: main.height / 2,
        width: main.width,
        height: main.height
    };
}
/***************************
Functions
***************************/

function positionDetails(prevX, prevY, x, y, centerY, startCenterX, startCenterY) {
    this.prevX = 0;
    this.prevY = 0;
    this.x = 0;
    this.y = 0;
    this.centerY = 0;
    this.startCenterX = 0;
    this.startCenterY = 0;
}

function size(height, width) {
    this.height = height;
    this.width = width;
}

function imageCanvasInfoDetails(imgSrc, previewCanvasSize, mainCanvasSize) {
    this.imgSrc = imgSrc;

}


//************NOVELLA CANVAS OBJECT*************************//
function novellaCanvas(isFlipX, isFlipY, isApproved, degree, scale, index) {
    var defaultScale = scale;
    //Properties
    this.index = index;
    this.isFlipX = isFlipX;
    this.needsToFlipX = false;
    this.isFlipY = isFlipY;
    this.needsToFlipY = false;
    this.isApproved = isApproved;
    this.degree = degree;
    this.scale = scale;
    this.src = null;
    this.lightenVal = 0;
    this.isDesat = false;
    this.isEditing = true;

    //Methods
    this.addImageDraw = addImageDraw;
    this.rotateImage = rotateImage;
    this.reDrawImage = reDrawImage;
    this.reset = function () {
        this.isFlipX = false;
        this.isFlipY = false;
        this.degree = 0;
        this.isDesat = false;
        this.scale = defaultScale;
        this.lightenVal = 0;
    };
}

function addImageDraw(srcPath, index) {
    this.reset();
    var self = this,
        myImg = new Image(),
        pc = getCanvasName('#PreviewCanvas', index),
        mc = getCanvasName('#MainCanvas', index),
        noIndex = typeof index === "undefined",
        draw = function () {
            self.reDrawImage();
        };


    myImg.onload = function () {
        var imgInfo = getImgInfo(this),
        previewC = $(pc)[0],
        mainC = $(mc)[0];


        setHWforCanvasDraw(previewC, imgInfo.canvasWidth, imgInfo.canvasHeight);
        setHWforCanvasDraw(mainC, imgInfo.canvasWidth, imgInfo.canvasHeight);

        self.scale = getImageScale(myImg);
        $('#Size .ui-slider-handle').css('bottom', (self.scale * 100) + '%');
        draw();
        if (noIndex) {
            centerCanvasMain();
            tryToPositionMargins();
        } else {
            centerCanvasMain(index);
            tryToPositionMargins(index);
            if (self.isApproved) {
                $(mc).draggable("disable");
            }
        }
    };
    this.src = myImg;
    this.srcPath = srcPath;
    myImg.src = srcPath;
}

function getImageScale(input) {
    var $bBox = $('#DesignCanvas'),
        bWidth = $bBox.css('width'),
        bHeight = $bBox.css('height');

    return determineScale({
        width: bWidth.substring(0, bWidth.length - 2),
        height: bHeight.substring(0, bHeight.length - 2)
    }, input);
}

function getImgInfo(theimg) {
    var constantRad = 45 * Math.PI / 180,
        canvasWidth = Math.abs((theimg.height) * Math.sin(constantRad)) + Math.abs((theimg.width) * Math.cos(constantRad)),
        canvasHeight = Math.abs((theimg.height) * Math.cos(constantRad)) + Math.abs((theimg.width) * Math.sin(constantRad));

    return {
        width: theimg.width,
        height: theimg.height,
        halfWidth: theimg.width / 2,
        halfHeight: theimg.height / 2,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
        halfCanvasWidth: canvasWidth / 2,
        halfCanvasHeight: canvasHeight / 2
    };
}

function reDrawImage() {
    var index = getSelectedCanvas().index,
        main;

    if ($("#MainCanvas").is(':visible')) {
        main = new canvasRender("MainCanvas", this, "PreviewCanvas");
    } else {
        main = new canvasRender("MainCanvas" + index, this, "PreviewCanvas" + index);
    }
    main.reDraw();
}


function rotateImage(direction) {
    var isReverse = (this.isFlipY && !this.isFlipX) || (!this.isFlipY && this.isFlipX),
        isCounterClockwise = direction === 'ccw';

    this.isReverse = isReverse;
    this.isCounterClockwise = isCounterClockwise;

    if ((this.isCounterClockwise && this.isReverse) || (!this.isCounterClockwise && !this.isReverse)) {
        this.degree += 45;
    }
    else if ((this.isCounterClockwise && !this.isReverse) || (!this.isCounterClockwise && this.isReverse)) {
        this.degree -= 45;
    }

    this.reDrawImage();
}

function setHWforCanvasDraw(canvas, newWidth, newHeight) {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = newWidth;
    canvas.height = newHeight;
}

function getBasePosition(containerSelector, canvasId) {
    var container = $(containerSelector),
            $canvas = container.find(canvasId),
            canvas = $canvas[0],
            baseLeft = (container.width() - canvas.width) / 2,
            baseTop = (container.height() - canvas.height) / 2;

    return { left: baseLeft, top: baseTop };
}

//************NOVELLA CANVAS OBJECT*************************//


//************CANVAS RENDER OBJECT*************************//
function canvasRender(canvasId, novellaCanvas, previewId) {
    this.previewId = previewId;
    this.current = getCanvasInfo(canvasId);
    this.novellaCanvas = novellaCanvas;
    this.needsToFlipX = novellaCanvas.needsToFlipX;
    this.needsToFlipY = novellaCanvas.needsToFlipY;
    this.imageManipulationHandlers = [this.brightness, this.desaturate];
}

canvasRender.prototype.reDraw = function () {
    this.flipCanvasHorizontal();
    this.flipCanvasVertical();
    this.rotateCanvas();
    this.manipulateImageData();
    this.mirrorPreview();
};

canvasRender.prototype.mirrorPreview = function () {
    var data = this.current.context.getImageData(0, 0, this.current.width, this.current.height);
    var mirrorContext = document.getElementById(this.previewId).getContext('2d');
    mirrorContext.putImageData(data, 0, 0);
    canvasEndProcessing();
};


canvasRender.prototype.manipulateImageData = function () {
    var ctx = this.current.context,
        self = this,
        imageData = ctx.getImageData(0, 0, this.current.width, this.current.height);

    //let each handler do what it wants with the imagaData before putting it back
    $.each(this.imageManipulationHandlers, function (index, handler) {
        handler.apply(self, [imageData]);
    });
    ctx.putImageData(imageData, 0, 0, 0, 0, imageData.width, imageData.height);
};

canvasRender.prototype.brightness = function (imageData) {
    if (this.novellaCanvas.lightenVal != 0) {
        var amount = Math.max(-1, Math.min(1, this.novellaCanvas.lightenVal));
        var mul = amount + 1;
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            data[i] = mul * data[i]; // red
            data[i + 1] = mul * data[i + 1]; // green
            data[i + 2] = mul * data[i + 2]; // blue
        }
    }
};

canvasRender.prototype.desaturate = function (imageData) {
    if (this.novellaCanvas.isDesat) {
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
            data[i] = brightness; // red
            data[i + 1] = brightness; // green
            data[i + 2] = brightness; // blue
        }
    }
};

canvasRender.prototype.resetCanvas = function () {
    this.current.context.clearRect(0, 0, this.current.width, this.current.height);
};

canvasRender.prototype.rotateCanvas = function () {
    var mc = this.current,
        nc = this.novellaCanvas,
        info = getImgInfo(nc.src),
        dw = info.width * nc.scale,
        dh = info.height * nc.scale,
        dx = (mc.width - dw) / 2,
        dy = (mc.height - dh) / 2;

    nc.dw = dw,
    nc.dh = dh,
    nc.dx = dx,
    nc.dy = dy;

    this.resetCanvas();
    mc.context.save();
    mc.context.translate(mc.halfWidth, mc.halfHeight);
    mc.context.rotate(nc.degree * Math.PI / 180);
    mc.context.translate(-mc.halfWidth, -mc.halfHeight);
    mc.context.drawImage(nc.src, dx, dy, dw, dh);
    mc.context.restore();
};


canvasRender.prototype.flipCanvasHorizontal = function () {
    if (this.needsToFlipX) {
        this.current.context.scale(-1, 1);
        this.current.context.translate(-this.current.width, 0);
        this.needsToFlipX = false;
        this.novellaCanvas.needsToFlipX = false;
    }
};

canvasRender.prototype.flipCanvasVertical = function () {
    if (this.needsToFlipY) {
        this.current.context.scale(1, -1);
        this.current.context.translate(0, -this.current.height);
        this.needsToFlipY = false;
        this.novellaCanvas.needsToFlipY = false;
    }
};


//************CANVAS RENDER OBJECT*************************//
