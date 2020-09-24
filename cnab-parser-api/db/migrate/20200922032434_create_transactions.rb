class CreateTransactions < ActiveRecord::Migration[6.0]
  def change
    create_table :transactions do |t|
      t.integer :code
      t.string :description
      t.string :nature

      t.timestamps
    end
  end
end
