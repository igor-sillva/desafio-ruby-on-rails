class CreateCnabs < ActiveRecord::Migration[6.0]
  def change
    create_table :cnabs do |t|
      t.references :transaction, null: false, foreign_key: true
      t.date :datetime
      t.float :value
      t.string :cpf, index: true
      t.string :credit_card
      t.string :owner, index: true
      t.string :company, index: true
      t.references :document, null: false, foreign_key: true, index: true

      t.timestamps
    end
  end
end
