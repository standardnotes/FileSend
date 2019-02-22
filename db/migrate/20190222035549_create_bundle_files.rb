class CreateBundleFiles < ActiveRecord::Migration[5.1]
  def change
    create_table :bundle_files do |t|
      t.integer :bundle_id
      t.string :storage_key
      t.string :url
      t.timestamps
    end
  end
end
