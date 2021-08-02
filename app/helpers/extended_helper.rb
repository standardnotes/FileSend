module ExtendedHelper
  require 'net/http'
  require 'uri'

  def self.is_extended_valid(email)
    url = "#{ENV["EXTENDED_VALIDATION_URL"]}?email=#{CGI.escape(email)}&key=#{ENV['EXTENDED_VALIDATION_KEY']}"
    uri = URI.parse(url)

    http = Net::HTTP.new(uri.host, uri.port)
    req = Net::HTTP::Get.new(uri.request_uri, 'Content-Type' => 'application/json')
    http.use_ssl = (uri.scheme == "https")
    response = http.request(req)

    Rails.logger.info "Extended validation response (#{response.code}): #{response.body}"

    if response.code[0] == "2"
      result = JSON.parse(response.body)
      return result["valid"]
    else
      return false
    end
  end

end
