# frozen_string_literal: true

require 'rails_helper'

describe "Document" do

  context "Abrindo arquivo" do
    let(:user) { User.create(email: 'igor_sillva@hotmail.com', password: '123456') }
    let(:file) { File.open(Rails.root.join('spec/CNAB.txt')) }

    let(:document) do 
      document = user.documents.build
      document.file.attach(io: file, filename: 'CNAB.txt', content_type: 'text/plain')
      document.save
      document.read_file
      document.normalize_files
      
      document
    end

    let(:normalized_file) { document.normalize_files.first }

    it "é do tipo text/plain?" do
      expect(document.file.attachment.content_type).to eq('text/plain')
    end

    it "tem layout válido?" do
      expect(document.normalize_files.select(&:nil?)).to be_empty
    end

    it "está normatizado?" do
      expect(normalized_file[:tx].code).to eql(3)
      expect(normalized_file[:datetime]).to eq(DateTime.parse("20190301T153453+0300"))
      expect(normalized_file[:value]).to eq("0000014200".to_i / 100)
      expect(normalized_file[:cpf]).to eql("09620676017")
      expect(normalized_file[:credit_card]).to eql("4753****3153")
      expect(normalized_file[:owner]).to eql("JOÃO MACEDO")
      expect(normalized_file[:company]).to eql("BAR DO JOÃO")
    end
  end
end
