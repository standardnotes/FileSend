FROM ruby:2.6.5-alpine

ARG UID=1000
ARG GID=1000

RUN addgroup -S filesend -g $GID && adduser -D -S filesend -G filesend -u $UID

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

RUN chown -R $UID:$GID .

USER filesend

COPY --chown=$UID:$GID package.json yarn.lock Gemfile Gemfile.lock /filesend/

COPY --chown=$UID:$GID vendor /filesend/vendor

RUN yarn install --frozen-lockfile

RUN gem install bundler && bundle install

COPY --chown=$UID:$GID . /filesend

EXPOSE 3000

ENTRYPOINT [ "docker/entrypoint.sh" ]

CMD [ "start" ]
