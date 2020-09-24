FROM ruby:2.6.5

ENV INSTALL_PATH /opt/app
RUN mkdir -p $INSTALL_PATH

RUN apt-get update && apt-get install -qq -y build-essential nodejs libpq-dev postgresql-client --fix-missing --no-install-recommends

ENV INSTALL_PATH /app
RUN mkdir -p $INSTALL_PATH

WORKDIR $INSTALL_PATH

RUN gem install rails bundler
COPY Gemfile Gemfile
RUN bundle install

RUN ruby --version
RUN rails --version
RUN bundle --version

COPY . .

VOLUME ["$INSTALL_PATH/public"]

CMD bundle exec puma -C config/puma.rb