class Bundle < ApplicationRecord
  include Tokenable

  # 120 Hours, or 5 Days
  MaxDuration = 120

  has_many :bundle_files

  def share_url
    "#{ENV['HOST']}/send/#{self.token}"
  end

  def add_file(url, key)
    file = self.bundle_files.create({url: url, storage_key: key})
    return file
  end

  def file_urls
    self.bundle_files.map { |file| file.url  }
  end

  def delete_all_files
    self.bundle_files.each do |file|
      obj = S3_BUCKET.object(file.storage_key)
      obj.delete
      file.destroy
    end
  end

  def self.delete_expired_files
    expired = Bundle.where("expiration <= ?", DateTime.now)
    expired.each do |bundle|
      bundle.delete_all_files
    end
    expired.delete_all
  end

end
