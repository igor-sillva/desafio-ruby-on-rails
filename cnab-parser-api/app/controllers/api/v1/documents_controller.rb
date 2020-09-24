class Api::V1::DocumentsController < Api::V1::ApiController

  before_action :set_document, only: [:show, :destroy]

  api :GET, '/documents', 'Lista todos os documentos carregados pelo usuário'  
  def index
    @documents = Current.user.documents
    json_success(@documents)
  end

  api :POST, '/documents', 'Cria um novo documento'
  param :file, ActionDispatch::Http::UploadedFile, desc: 'Arquivo para carga'
  def create
    @document = Current.user.documents.build
    @document.file.attach(document_params[:file])

    if @document.save
      @document.read_file
      
      if @document.build_cnabs!
        return json_success(@document, :created)
      else
        @document.destroy
        return json_error("Erro ao processar cnabs")
      end
    end

    json_error(@document.errors.messages)
  end

  api :DELETE, '/documents/:id', 'Deleta um documento com determinado id'
  param :id, :number, desc: 'Id do documento'
  def destroy
    @document.destroy
    head :no_content
  end

  private
  def set_document
    @document ||= Current.user.documents.find(params[:id])
  end

  def document_params
    params.permit(:file)
  end
end
