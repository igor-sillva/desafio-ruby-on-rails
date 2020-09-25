SimpleCov.start do
  add_group "Models", "app/models"
  add_group "Controllers", "app/controllers"
  add_filter %r{^/spec|config|db/}
end