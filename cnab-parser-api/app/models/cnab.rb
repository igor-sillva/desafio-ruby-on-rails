# frozen_string_literal: true

class Cnab < ApplicationRecord

  belongs_to :tx, class_name: 'Transaction', foreign_key: :transaction_id
  belongs_to :document

  validates :datetime, presence: true
  validates :value, presence: true
  validates :cpf, presence: true
  validates :credit_card, presence: true
  validates :owner, presence: true
  validates :company, presence: true    
end
