# frozen_string_literal: true

class Api::V1::Auth::RegistrationsController < DeviseTokenAuth::RegistrationsController
  before_action :configure_sign_up_params, only: [:create]

  # POST /resource
  def create
    super
  end

  protected

  # If you have extra params to permit, append them to the sanitizer.
  def configure_sign_up_params
    devise_parameter_sanitizer.permit(:registration, keys: [:email, :password])
  end

  def render_create_success
    json_success(@resource)
  end

  def render_create_error
    json_error(@resource.errors.full_messages)
  end
end
