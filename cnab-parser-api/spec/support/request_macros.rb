module RequestMacros

  def login(email, password)
    headers = { 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json' }
    post '/api/v1/auth/sign_in', params: { email: email, password: password }.to_json, headers: headers 
  end
  
  def get_auth_params(response)
    client = response.headers['client']
    token = response.headers['access-token']
    expiry = response.headers['expiry']
    token_type = response.headers['token-type']
    uid = response.headers['uid']
  
    auth_params = {
      'access-token' => token,
      'client' => client,
      'uid' => uid,
      'expiry' => expiry,
      'token-type' => token_type
    }
  
    auth_params
  end

end