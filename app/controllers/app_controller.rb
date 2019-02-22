class AppController < ApplicationController

  def index
    @host = ENV['HOST']
  end

end
