class Bundle < ApplicationRecord
  include Tokenable

  # 120 Hours, or 5 Days
  MaxDuration = 120

  has_many :bundle_files

  def share_url
    "#{ENV['HOST']}/send/#{self.token}"
  end

  def deletion_link
    "#{ENV['HOST']}/api/files/delete/?token=#{self.token}&admin_token=#{self.admin_token}"
  end

  def add_file(url, key)
    file = self.bundle_files.create({url: url, storage_key: key})
    return file
  end

  def file_urls
    self.bundle_files.map { |file| file.url  }
  end

  def perform_deletion
    if self.notification_email
      # Wait a little bit to ensure the bundle download email is sent first
      # Send raw parameters as the bundle itself may be deleted by email send time
      BundlesMailer.bundle_deleted(self.notification_email, self.created_at.to_i, self.download_count).deliver_later(wait: 5.seconds)
    end

    self.delete_all_files
    self.destroy
  end

  def delete_all_files
    self.bundle_files.each do |file|
      obj = S3_BUCKET.object(file.storage_key)
      obj.delete
      file.destroy
    end
  end

  def self.delete_expired_files
    begin
      expired = Bundle.where("expiration <= ?", DateTime.now)
      Rails.logger.info "Found #{expired.size} expired bundles"
      expired.each do |bundle|
        bundle.perform_deletion
      end
    rescue => exception
      Rails.logger.error "Could not delete expired bundles: #{exception.message}"
    end
  end

end
