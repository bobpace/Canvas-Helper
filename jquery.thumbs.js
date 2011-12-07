/*
 *
 * Copyright (c) 2006-2010 Joan Piedra (http://joanpiedra.com)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 * 
 */
(function($) {

/*
 * Converts image and link elements to thumbnails
 *
 * @name     $.fn.thumbs
 * @author   Joan Piedra (http://joanpiedra.com)
 * @example  $('.thumb').thumbs();
 *
 */
$.fn.thumbs = function(options) {
  var $thumbs = this;
  
  if (options == 'destroy') {
    return Thumbs.destroy($thumbs);
  }
  
  if( $thumbs.data('thumbs') ) {
    return $thumbs;
  }
  
  var center = {},
  defaults = {
    center: true,
    classNames: {
      center: 'thumb-center',
      container: 'thumb-container',
      img: 'thumb-img',
      inner: 'thumb-inner',
    },
    html: '<span class="%container%"><span class="%inner%"><span class="%img%"></span></span></span>'
  };
  
  options = $.extend(true, {}, defaults, options);
  
  return $thumbs.each(function(){
    var $thumb = $(this),
        c = options.classNames,
        clone = $thumb.clone(true),
        html = new String(options.html),
        centered = false;
    
    for (className in c) {
      var newClassName = c[className];
      
      if ( options.center && !centered && className == 'container' ) {
        newClassName = c.container + ' ' + c.center;
        centered = true;
      }
      
      html = html.replace('%' + className + '%', newClassName);
    }
    
    $thumb.wrap( html );
    
    if (options.center) {
      Thumbs.centerImg( $thumb );
    }
    
    var data = {
      'container': $thumb.parents('.' + c.container),
      'raw': clone
    };
    
    $thumb.data('thumbs', data);
  });
};


var Thumbs = {

  /*
   * Private: Absolute positions the image in the center of the thumbnail frame
   *
   * @name     thumbs.centerImg
   * @author   Joan Piedra (http://joanpiedra.com)
   * @example  Thumbs.centerImg($thumb);
   *
   */
  centerImg: function($thumb) {
    var $img = $thumb.is('img') ? $thumb : $thumb.find('img'),
        img = $img[0];

    img.onload = function() {
      var css = {
        left: '-' + parseInt( img.width / 2 ) + 'px',
        top: '-' + parseInt( img.height / 2 ) + 'px'
      };
      $img.css( css );
    }
  
    return $thumb;
  },

  /*
   * Private: Removes all the added thumbnail html
   *
   * @name     thumbs.destroy
   * @author   Joan Piedra (http://joanpiedra.com)
   * @example  Thumbs.destroy($thumbs);
   *
   */
  destroy: function($thumbs) {
    $thumbs.each(function(index) {
      var $thumb = $(this),
      data = $thumb.data('thumbs');
      
      if (!data) {
        return;
      }
      
      data.container.after(data.raw).remove();
    });
  }

}

})(jQuery);
