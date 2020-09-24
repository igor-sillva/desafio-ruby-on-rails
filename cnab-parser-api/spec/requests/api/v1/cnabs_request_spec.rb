# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::CnabsController, type: :request do

  before(:each) do
    @current_user = User.create(email: 'igor_sillva@hotmail.com', password: '123456')
    login(@current_user.email, "123456")
    @auth_params = get_auth_params(response)
  end

  describe 'GET /api/v1/cnabs' do

    before { get '/api/v1/cnabs', headers: @auth_params }

    it "retorna os cnabs do usuario" do
      expect{ response }.to change(Cnab, :count).by(0)
    end

  end

end
