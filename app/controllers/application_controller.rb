class ApplicationController < ActionController::API

  before_action {
    @title = "FileSend | Simple, encrypted file sharing."
    @desc = "FileSend is a free, secure file sharing service that encrypts files with client-side AES-256 encryption and does not log IP addresses. Files are permanently deleted from our servers on download or after specified duration."
    @meta_image = "https://s3.amazonaws.com/standard-notes/media/filesend-share-image.png"
  }

  def route_not_found
    render :json => {:error => {:message => "Not found."}}, :status => 404
  end

  private

  def append_info_to_payload(payload)
    super

    unless payload[:status]
      return
    end

    payload[:level] = 'INFO'
    if payload[:status] >= 500
      payload[:level] = 'ERROR'
    elsif payload[:status] >= 400
      payload[:level] = 'WARN'
    end
  end
end
