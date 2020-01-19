FROM mcr.microsoft.com/dotnet/core/sdk:3.0 AS builder

WORKDIR /app

# Copy files
COPY backend .
WORKDIR /app/DataAccumulator
RUN dotnet publish --configuration Debug --output out

# Build runtime image
FROM mcr.microsoft.com/dotnet/core/aspnet:3.0 AS base
EXPOSE 80
EXPOSE 443

WORKDIR /app/DataAccumulator/out

COPY --from=builder . .
ENTRYPOINT ["dotnet", "DataAccumulator.WebApi.dll"]