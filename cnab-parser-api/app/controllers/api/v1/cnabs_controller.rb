# frozen_string_literal: true

class Api::V1::CnabsController < ApplicationController

  before_action :set_cnab, only: [:destroy]

  api :GET, '/cnabs', 'Lista todos as movimentações carregadas no sistema'  
  def index
    @cnabs = Current.user.cnabs
    json_success(@cnabs)
  end

  api :DELETE, '/canbs/:id', 'Deleta uma movimentação com determinado id'
  param :id, :number, desc: 'Id do documento'
  def destroy
    @cnab.destroy
    head :no_content
  end

  private
  def set_cnab
    @cnab ||= Current.user.cnabs.find(params[:id])
  end

end
