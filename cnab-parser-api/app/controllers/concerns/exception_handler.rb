# frozen_string_literal: true

module ExceptionHandler
  extend ActiveSupport::Concern

  included do
    rescue_from ActionController::ParameterMissing do |e|
      json_error(e.message, :unprocessable_entity)
    end

    rescue_from ActionController::RoutingError do |e|
      json_error(e.message, :not_found)
    end

    rescue_from ActiveRecord::RecordNotFound do |e|
      json_error(e.message, :not_found)
    end

    rescue_from ActiveRecord::RecordInvalid do |e|
      json_error(e.message, :unprocessable_entity)
    end

    rescue_from CanCan::AccessDenied do |e|
      json_error(e.message, :forbidden)
    end
  end
end