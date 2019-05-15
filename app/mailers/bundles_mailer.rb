class BundlesMailer < ApplicationMailer

  def subscribed(bundle_id)
    @bundle = Bundle.find(bundle_id)
    mail(to: @bundle.notification_email, subject: "You've subscribed to a new FileSend file.")
  end

  def bundle_downloaded(bundle_id)
    @bundle = Bundle.find(bundle_id)
    mail(to: @bundle.notification_email, subject: "Your FileSend file has been downloaded.")
  end

  def bundle_deleted(email, created_at, download_count)
    @created_at = Time.at(created_at).to_datetime
    @download_count = download_count
    mail(to: email, subject: "Your FileSend file has been deleted.")
  end

end
