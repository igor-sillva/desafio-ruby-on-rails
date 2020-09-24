class Current < ActiveSupport::CurrentAttributes
  attribute :profile, :user
  attribute :request_id, :user_agent, :ip_address

  def user=(user)
    super
  end
end