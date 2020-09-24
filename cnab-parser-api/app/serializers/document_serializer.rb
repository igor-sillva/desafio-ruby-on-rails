class DocumentSerializer < ActiveModel::Serializer
  attributes :id, :name, :processed_at

  def name
    object.file.filename
  end
end
