class BundlesController < ApplicationController

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
    bundle.deletion_token = params[:deletion_token]

    s3 = Aws::S3::Resource.new

    # upload to aws
    files.each do |file|
      filename = "#{bundle.token}/#{SecureRandom.uuid}"

      # Make an object in your bucket for your upload
      obj = s3.bucket(ENV['S3_BUCKET']).object(filename)

      # Upload the file
      obj.put(body: file, acl: "public-read")

      bundle.add_file(obj.public_url, obj.key)
    end

    bundle.save

    render :json => {:share_url => bundle.share_url}
  end

  def download
    bundle = Bundle.find_by_token(params[:token])
    if !bundle
      render :json => {:error => {:message => "File not found."}}, :status => 404
      return
    end

    render :json => {urls: bundle.file_urls}
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

    # only delete if duration is 0
    if bundle.duration != 0
      render :json => {:error => {:message => "Deletion token invalid."}}, :status => 401
      return
    end

    bundle.delete_all_files
    bundle.destroy

    render :json => {:success => true}
  end


end
