class ApplicationMailer < ActionMailer::Base
  default from: 'FileSend <filesend@standardnotes.org>'
  layout 'mailer'
end
