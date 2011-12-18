#!/usr/bin/env ruby

module BoxHelper
  def BoxHelper.determineSize(boundingBox, sourceBox)
    max_width = boundingBox.width.to_f
    max_height = boundingBox.height.to_f
    width = sourceBox.width.to_f
    height = sourceBox.height.to_f

    if width > height
      if width > max_width
        height *= max_width / width;
        width = max_width;
      end
    else
      if height > max_height
        width *= max_height / height;
        height = max_height;
      end
    end

    Box.new(width, height)
  end

  def BoxHelper.determineScale(boundingBox, sourceBox)
    if boundingBox >= sourceBox
      return 1
    else
      size = BoxHelper.determineSize boundingBox, sourceBox
      (1..100).each do |x|
        scale = x.to_f / 100
        scaledBox = sourceBox.scale(scale)
        if scaledBox >= size
          return scale
        end
      end
    end

    return 'no answer'
  end
end

class Box
  include Comparable
  attr_accessor :width, :height
  def initialize(width, height)
    @width = width
    @height = height
  end

  def to_s
    "width: #{@width} height: #{@height}"
  end

  def scale(scale)
    Box.new @width.to_f * scale, @height.to_f * scale
  end

  def <=>(other)
    [@width,@height] <=> [other.width,other.height]
  end
end


container = Box.new 500,500
image = Box.new 1200,800

puts BoxHelper.determineScale container, image
