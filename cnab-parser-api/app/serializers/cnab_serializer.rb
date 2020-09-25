class CnabSerializer < ActiveModel::Serializer
  attributes :id, :code, :type, :incoming, :value, :cpf, :datetime, :credit_card, :owner, :company

  def code
    object.tx.code
  end

  def type
    object.tx.description
  end

  def incoming
    object.tx.incoming?
  end

  def value
    object.tx.convert(object.value)
  end
end
