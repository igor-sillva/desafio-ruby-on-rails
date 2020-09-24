class ApplicationController < ActionController::API

  include Response
  include ExceptionHandler
  include SetCurrent
  include DeviseTokenAuth::Concerns::SetUserByToken

  def current_user
    @current_user ||= current_api_v1_user
  end
end
