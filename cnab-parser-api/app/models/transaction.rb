class Transaction < ApplicationRecord

  enum nature: {
    incoming: "Entrada",
    outcoming: "Saída"
  }

  validates :code, uniqueness: true
  validates :description, uniqueness: true

  def convert(value)
    return +value.abs if incoming?
    return -value.abs if outcoming?
  end
end
