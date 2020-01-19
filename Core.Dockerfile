FROM mcr.microsoft.com/dotnet/core/sdk:3.0 AS builder

WORKDIR /app

# Copy files
COPY backend .
WORKDIR /app/Watcher
RUN dotnet publish --configuration Debug --output out

# Build runtime image
FROM mcr.microsoft.com/dotnet/core/aspnet:3.0 AS base

WORKDIR /app
COPY --from=builder ./Watcher/out .

EXPOSE 80
EXPOSE 443
ENTRYPOINT ["dotnet", "Watcher.Core.dll"]