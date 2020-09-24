# frozen_string_literal: true

class User < ActiveRecord::Base
  
  extend Devise::Models
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  include DeviseTokenAuth::Concerns::User

  has_many :documents, dependent: :destroy
  has_many :cnabs, through: :documents

  validates :email, uniqueness: true

  before_create :set_uid
  before_validation :set_provider

  class << self
    def generate_uid
      loop do
        token = Devise.friendly_token
        break token unless to_adapter.find_first(uid: token)
      end
    end
  end

  protected
  
  def set_provider
    self.provider = :email if provider.blank?
  end

  def set_uid
    self.uid = User.generate_uid
  end
end
