class CreateDocuments < ActiveRecord::Migration[6.0]
  def change
    create_table :documents do |t|
      t.references :user, null: false, foreign_key: true
      t.datetime :processed_at

      t.timestamps
    end
  end
end
