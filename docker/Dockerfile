FROM nginx:latest
MAINTAINER Oleg Makarov <om@bankexfoundation.org>

ADD /dist /opt/dist
ADD /abi /opt/abi
ADD docker/default-http.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
