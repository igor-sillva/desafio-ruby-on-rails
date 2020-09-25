# frozen_string_literal: true

require 'rails_helper'
include ActionController::RespondWith

describe Api::V1::DocumentsController, type: :request do

  before(:each) do
    @current_user = User.create(email: 'igor_sillva@hotmail.com', password: '123456')
    login(@current_user.email, "123456")
    @auth_params = get_auth_params(response)
  end

  describe 'GET /api/v1/documents' do
    before { get '/api/v1/documents', headers: @auth_params }

    it "retorna os documentos criados pelo usuario" do
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST /api/v1/documents' do
    let(:file_to_upload) { fixture_file_upload(Rails.root.join('spec/CNAB.txt'), 'text/plain') }
    
    it 'carrega 1 arquivo e salva 21 cnabs' do
      post '/api/v1/documents', params: { file: file_to_upload }, headers: @auth_params
      
      expect(Document.count).to eql(1)
      expect(Cnab.count).to eql(21)
    end
  end

  describe 'POST /api/v1/documents' do
    let(:file_to_upload) { fixture_file_upload(Rails.root.join('spec/CNABINVALID.txt'), 'text/plain') }
    
    it 'é valido o arquivo?' do
      post '/api/v1/documents', params: { file: file_to_upload }, headers: @auth_params
      
      expect(response).to have_http_status(422)
    end
  end

  describe 'POST /api/v1/documents' do    
    it 'arquivo está presente?' do
      post '/api/v1/documents', headers: @auth_params
      
      expect(response).to have_http_status(422)
    end
  end

  describe 'DELETE /api/v1/documents' do
    let(:file) { File.open(Rails.root.join('spec/CNAB.txt')) }
    before do 
      @document = @current_user.documents.build
      @document.file.attach(io: file, filename: 'CNAB.txt', content_type: 'text/plain')
      @document.save
    end


    before { delete "/api/v1/documents/#{@document.id}", headers: @auth_params }

    it "deleta document e retorna :no_content" do
      expect(response).to have_http_status(:no_content)
    end
  end
end