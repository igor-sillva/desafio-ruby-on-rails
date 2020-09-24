Rails.application.routes.draw do
  apipie

  namespace :api do
    namespace :v1 do 
      mount_devise_token_auth_for 'User', at: 'auth',
        controllers: {
          registrations: 'api/v1/auth/registrations'
        }

      resources :documents, only: [:index, :create, :destroy]
      resources :cnabs, only: [:index, :destroy]
    end
  end
end
