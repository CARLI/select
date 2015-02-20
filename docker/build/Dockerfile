FROM ubuntu:14.04
MAINTAINER carli@pixotech.com

# Update system packages
RUN apt-get update

# Install required system packages
RUN apt-get -qq install git curl ruby
# Use PPA for nodejs, because the official package lags behind
RUN curl -sL https://deb.nodesource.com/setup | bash - 
RUN apt-get -qq install nodejs build-essential
# Required for PhantomJS
RUN apt-get -qq install libfreetype6 libfontconfig

# Install convenient global npm packages
RUN npm install -g grunt-cli
RUN npm install -g bower
RUN gem install sass

# Copy in project files
COPY . /carli-select
VOLUME /carli-select

EXPOSE 8000

# Install project dependencies
RUN touch /carli-select/config/local.js && touch /carli-select/config/environmentDependentModules.js
RUN cd /carli-select && ./install-dependencies.sh
