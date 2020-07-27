Rails.application.routes.draw do
  get "api/files/download/:token" => "bundles#download"
  post "api/files/save" => "bundles#save"
  post "api/files/successful_download" => "bundles#successful_download"

  post "api/files/subscribe" => "bundles#subscribe"
  get "api/files/delete" => "bundles#delete"

  match '*path' => 'app#index', :via => [:get]

  get '*unmatched_route', to: 'application#route_not_found'

  root "app#index"
end
