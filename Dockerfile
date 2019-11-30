# FROM nginx:alpine

# COPY nginx.conf /etc/nginx/nginx.conf

# WORKDIR /usr/share/nginx/html
# COPY dist/ .


# base image
FROM node:12.13.0

# set working directory
WORKDIR /frontend

# add `/app/node_modules/.bin` to $PATH
# ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
# COPY package.json /app/package.json
RUN npm install
RUN npm install -g @angular/cli@latest

# add app
COPY . /frontend

# start app
CMD ng serve --host 0.0.0.0


# FROM mcr.microsoft.com/dotnet/core/aspnet:2.2 AS base
# WORKDIR /output
# EXPOSE 80
# EXPOSE 443

# FROM mcr.microsoft.com/dotnet/core/sdk:2.2 AS build
# WORKDIR /src
# COPY LamaAPI/ source/
# COPY Shared/ Shared/
# WORKDIR source
# RUN dotnet publish -c Release -o output

# FROM base AS final
# COPY --from=build /src/source/Lama/output .
# ENTRYPOINT ["dotnet", "Lama.dll"]