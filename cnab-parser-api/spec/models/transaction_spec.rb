# frozen_string_literal: true

require 'rails_helper'

describe Transaction do

  describe "Conversão" do
    context "Entradas" do
      it "converte número para positivo" do
        tx = Transaction.new(code: 1, description: 'Débito', nature: 'Entrada')
        conversion = tx.convert(10000)

        expect(conversion).to eq(10000)
      end
    end

    context "Saídas" do 
      it "converte número para negativo" do
        tx = Transaction.new(code: 2, description: 'Boleto', nature: 'Saída')
        conversion = tx.convert(10000)

        expect(conversion).to eq(-10000)
      end
    end
  end
end
