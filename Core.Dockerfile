FROM mcr.microsoft.com/dotnet/core/sdk:3.0 AS builder

WORKDIR /app

# Copy files
COPY backend .
WORKDIR /app/Watcher
RUN dotnet publish --configuration Debug --output out

# Build runtime image
FROM mcr.microsoft.com/dotnet/core/aspnet:3.0 AS base
EXPOSE 80
EXPOSE 443

WORKDIR /app/Watcher/out

COPY --from=builder . .
ENTRYPOINT ["dotnet", "Watcher.Core.dll"]