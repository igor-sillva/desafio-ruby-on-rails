# frozen_string_literal: true

require 'rails_helper'

describe Cnab do
  let(:cnab) { Cnab.new }
  
  it 'é valido' do
    expect(cnab).to_not be_valid
  end
end
