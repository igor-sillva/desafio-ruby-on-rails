# frozen_string_literal: true

require 'rails_helper'
include ActionController::RespondWith

describe Api::V1::DocumentsController, type: :request do

  before(:each) do
    @current_user = User.create(email: 'igor_sillva@hotmail.com', password: '123456')
    login(@current_user.email, "123456")
    @auth_params = get_auth_params(response)
  end

  describe 'POST /api/v1/documents' do

    let(:file_to_upload) { fixture_file_upload(Rails.root.join('spec/CNAB.txt'), 'text/plain') }
    
    it 'carrega 1 arquivo e salva 21 cnabs' do
      post '/api/v1/documents', params: { file: file_to_upload }, headers: @auth_params
      
      expect(Document.count).to eql(1)
      expect(Cnab.count).to eql(21)
    end
  end
end