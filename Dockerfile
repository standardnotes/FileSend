FROM ruby:2.6.5-alpine

RUN apk add --update --no-cache \
    alpine-sdk \
    mariadb-dev \
    sqlite-dev \
    git \
    make \
    g++ \
    nodejs \
    nodejs-npm \
    python \
    yarn \
    tzdata

WORKDIR /filesend

COPY package.json yarn.lock Gemfile Gemfile.lock /filesend/

COPY vendor /filesend/vendor

RUN yarn install

RUN gem install bundler && bundle install

COPY . /filesend

EXPOSE 3000

ENTRYPOINT [ "docker/entrypoint.sh" ]

CMD [ "start" ]
