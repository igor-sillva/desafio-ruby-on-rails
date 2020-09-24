# frozen_string_literal: true

class CnabNormalizer

  attr_accessor :text, :regexp, :match

  def initialize(text)
    @text ||= text
    @regexp = %r{
      ^(?<type>\d{1})
      (?<date>\d{8})
      (?<value>\d{10})
      (?<document>\d{11})
      (?<credit_card>\d{4}\*{4}\d{4})
      (?<time>\d{6})
      (?<owner>.{14})
      (?<company>.{1,})$
    }x
  end

  def valid?
    !!(@text =~ @regexp)
  end

  def normalize
    return nil unless valid?
    @match = @text.match(@regexp)

    {
      tx: Transaction.find_or_create_by(code: @match[:type]),
      value: @match[:value].to_i / 100,
      datetime: DateTime.parse("#{@match[:date]}T#{@match[:time]}+0300"),
      cpf: @match[:document],
      credit_card: @match[:credit_card],
      owner: to_utf8(@match[:owner].strip),
      company: to_utf8(@match[:company].strip)
    }
  end

  private
  def to_utf8(str)
    str.force_encoding('UTF-8')
  end
end