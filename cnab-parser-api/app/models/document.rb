# frozen_string_literal: true

class Document < ApplicationRecord

  belongs_to :user

  has_many :cnabs, dependent: :destroy
  has_one_attached :file, dependent: :destroy

  accepts_nested_attributes_for :cnabs

  validates :file, presence: true

  validate :acceptable_file

  def read_file(&block)
    return if not file.attached?
    reader.read_file! &block
  end

  def to_a
    reader.lines
  end

  def normalize_files
    @normalize_files ||= to_a.map { |line| CnabNormalizer.new(line).normalize }
  end

  def build_cnabs
    normalize_files.map { |c| cnabs.build(c) }
  end

  def build_cnabs!
    build_cnabs
    self.processed_at = Time.now
    save
  end

  protected
  def acceptable_file
    return unless file.attached?
  
    errors.add(:file, "não é do tipo text/plain") if not file.text?
  end

  def reader
    @reader ||= DocumentReader.new(self.file)
  end
end
