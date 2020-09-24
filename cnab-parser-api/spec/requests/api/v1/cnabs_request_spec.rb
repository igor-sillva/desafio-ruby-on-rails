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
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'DELETE /api/v1/cnabs' do
    let(:file) { File.open(Rails.root.join('spec/CNAB.txt')) }
    before do 
      document = @current_user.documents.build
      document.file.attach(io: file, filename: 'CNAB.txt', content_type: 'text/plain')
      document.save
      document.read_file
      document.build_cnabs!

      @cnab = Cnab.first
    end


    before { delete "/api/v1/cnabs/#{@cnab.id}", headers: @auth_params }

    it "deleta cnab e retorna :no_content" do
      expect(response).to have_http_status(:no_content)
    end
  end

end
