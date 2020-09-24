# frozen_string_literal: true

class Api::V1::ApiController < ApplicationController  
	before_action :authenticate_api_v1_user!
	load_and_authorize_resource
end