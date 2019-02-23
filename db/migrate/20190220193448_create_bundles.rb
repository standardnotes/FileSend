class CreateBundles < ActiveRecord::Migration[5.1]
  def change
    create_table :bundles do |t|
      t.string :token
      t.string :deletion_token
      t.string :admin_token
      t.string :notification_email

      t.datetime :expiration
      t.integer :duration
      t.integer :download_count, :default => 0
      t.integer :download_limit

      t.timestamps

      t.index :token, :unique => true
      t.index :expiration
    end
  end
end
