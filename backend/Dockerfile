FROM ruby:3.2.2

# 必要なパッケージのインストール (AWS CLI 用)
RUN apt-get update -qq && apt-get install -y

WORKDIR /app

COPY Gemfile /app/Gemfile
COPY Gemfile.lock /app/Gemfile.lock

RUN gem install bundler
RUN bundle install

COPY . /app

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

RUN apt-get update && apt-get install -y less vim curl unzip sudo

RUN apt-get update -qq && apt-get install -y \
  curl \
  unzip \
  && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
  && unzip awscliv2.zip \
  && sudo ./aws/install \
  && rm -rf awscliv2.zip aws

EXPOSE 3002

CMD ["rails", "server", "-b", "0.0.0.0"]
