set :output, 'log/whenever.log'

every 1.minute  do
  runner "Bundle.delete_expired_files"
end
