class ApplicationController < ActionController::Base
  protect_from_forgery with: :null_session

  before_action :set_raven_context

  before_action {
    @title = "FileSend | Simple, encrypted file sharing."
    @desc = "FileSend is a free, secure file sharing service that encrypts files with client-side AES-256 encryption and does not log IP addresses. Files are permanently deleted from our servers on download or after specified duration."
    @meta_image = "https://s3.amazonaws.com/standard-notes/media/filesend-share-image.png"
  }

  private

  def set_raven_context
    Raven.extra_context(params: params.to_unsafe_h, url: request.url)
  end
end
