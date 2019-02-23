class ApplicationMailer < ActionMailer::Base
  default from: 'SN|FileSend <filesend@standardnotes.org>'
  layout 'mailer'
end
