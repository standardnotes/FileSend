# Preview all emails at http://localhost:3000/rails/mailers/bundles_mailer
class BundlesMailerPreview < ActionMailer::Preview

  def subscribed
    @bundle = Bundle.last
    BundlesMailer.subscribed(@bundle.id)
  end

  def bundle_downloaded
    @bundle = Bundle.last
    BundlesMailer.bundle_downloaded(@bundle.id)
  end

  def bundle_deleted
    @bundle = Bundle.last
    BundlesMailer.bundle_deleted(@bundle.notification_email, @bundle.created_at, @bundle.download_count)
  end


end
