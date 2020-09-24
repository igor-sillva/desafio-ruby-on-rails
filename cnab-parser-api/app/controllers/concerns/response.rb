module Response 
  def json_success(object, status = :ok)
    render json: object, root: 'data', adapter: :json, status: status
  end

  def json_error(message, status = :unprocessable_entity)
    render json: {
      success: false,
      errors: [ message ].flatten
    }, status: status
  end
end