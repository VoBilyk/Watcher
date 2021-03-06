FROM mcr.microsoft.com/dotnet/core/sdk:3.0 AS builder

WORKDIR /app

# Copy files
COPY backend .
WORKDIR /app/DataAccumulator
RUN dotnet publish --configuration Debug --output out

# Build runtime image
FROM mcr.microsoft.com/dotnet/core/aspnet:3.0 AS runtime
EXPOSE 80
EXPOSE 443

WORKDIR /app
COPY --from=builder /app/DataAccumulator/out .

ENTRYPOINT ["dotnet", "DataAccumulator.WebAPI.dll"]