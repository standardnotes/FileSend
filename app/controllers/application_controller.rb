class ApplicationController < ActionController::Base
  protect_from_forgery with: :null_session

  before_action {
    @title = "FileSend | Simple, encrypted file sharing."
    @desc = "FileSend is a free, secure file sharing service that encrypts files with client-side AES-256 encryption and does not log IP addresses. Files are permanently deleted from our servers on download or after specified duration."
    @meta_image = "https://s3.amazonaws.com/standard-notes/media/filesend-share-image.png"
  }
end
