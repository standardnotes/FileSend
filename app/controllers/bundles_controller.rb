class BundlesController < ApplicationController

  include ExtendedHelper

  def save
    files = params[:files]
    bundle = Bundle.create
    duration = [Bundle::MaxDuration, params[:duration].to_i].min

    # Delete immediately after download, max duration
    if duration == 0
      bundle.expiration = DateTime.now + Bundle::MaxDuration.hours
    else
      bundle.expiration = DateTime.now + duration.hours
    end

    bundle.duration = duration
    bundle.download_limit = params[:download_limit]
    bundle.deletion_token = params[:deletion_token]

    # upload to AWS
    files.each do |file|
      filename = "#{bundle.token}/#{SecureRandom.uuid}"
      obj = S3_BUCKET.object(filename)
      obj.put(body: file, acl: "public-read")
      bundle.add_file(obj.public_url, obj.key)
    end

    bundle.save

    render :json => {
      :share_url => bundle.share_url,
      :bundle_token => bundle.token,
      :admin_token => bundle.admin_token
    }
  end

  def download
    bundle = Bundle.find_by_token(params[:token])
    if !bundle
      render :json => {:error => {:message => "File not found."}}, :status => 404
      return
    end

    render :json => {urls: bundle.file_urls}
  end

  def subscribe
    bundle = Bundle.find_by_token(params[:token])
    if !bundle
      render :json => {:error => {:message => "File not found."}}, :status => 404
      return
    end

    if bundle.admin_token != params[:admin_token]
      render :json => {:error => {:message => "Invalid admin token."}}, :status => 401
      return
    end

    is_valid = ExtendedHelper.is_extended_valid(params[:email])
    if is_valid
      bundle.notification_email = params[:email]
      bundle.save

      BundlesMailer.subscribed(bundle.id).deliver_later
      render :json => {success: true}
    else
      render :json => {success: false}
    end
  end

  def successful_download
    bundle = Bundle.find_by_token(params[:token])
    if !bundle
      render :json => {:error => {:message => "File not found."}}, :status => 404
      return
    end

    if bundle.deletion_token != params[:deletion_token]
      render :json => {:error => {:message => "Deletion token invalid."}}, :status => 401
      return
    end

    bundle.download_count = bundle.download_count + 1
    bundle.save

    if bundle.notification_email
      BundlesMailer.bundle_downloaded(bundle.id).deliver_later
    end

    if bundle.download_limit && bundle.download_limit > 0
      if bundle.download_count >= bundle.download_limit
        bundle.perform_deletion
      end
    end

    render :json => {:success => true}
  end

  def delete
    bundle = Bundle.find_by_token(params[:token])
    if !bundle
      render :json => {:error => {:message => "File not found."}}, :status => 404
      return
    end

    if bundle.admin_token != params[:admin_token]
      render :json => {:error => {:message => "Invalid admin token."}}, :status => 401
      return
    end

    bundle.perform_deletion
  end


end
