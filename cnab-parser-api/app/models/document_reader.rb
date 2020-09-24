class DocumentReader

  attr_accessor :file, :lines, :loaded

  def initialize(file)
    @file ||= file
    @lines ||= []
    @loaded = false
  end

  def read_file! &block
    return @lines if loaded?

    @file.open do |f|
      @lines = f.readlines.map(&:chomp)
      @loaded = true

      block.call(f) unless block.nil?
      f.close
    end

    @lines
  end

  private
  def loaded?
    @loaded
  end

end