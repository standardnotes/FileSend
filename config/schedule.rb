set :output, 'log/whenever.log'

every 1.hour  do
  runner "Bundle.delete_expired_files"
end
