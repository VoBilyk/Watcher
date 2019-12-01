using System.Linq;
using System.Reflection;

using Microsoft.AspNetCore.Http;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Watcher.Utils
{
    public class FormFileOperationFilter : IOperationFilter
    {
        private const string FormDataMimeType = "multipart/form-data";

        private static readonly string[] FormFilePropertyNames =
            typeof(IFormFile).GetTypeInfo().DeclaredProperties.Select(x => x.Name).ToArray();

        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            if (context.ApiDescription.ParameterDescriptions.Any(
                x => x.ModelMetadata.ContainerType == typeof(IFormFile)))
            {
                var formFileParameters = operation.Parameters
                    .Where(x => FormFilePropertyNames.Contains(x.Name)).ToArray();

                var index = operation.Parameters.IndexOf(formFileParameters.First());
                foreach (var formFileParameter in formFileParameters)
                {
                    operation.Parameters.Remove(formFileParameter);
                }

                var formFileParameterName = context.ApiDescription.ActionDescriptor.Parameters
                    .Where(x => x.ParameterType == typeof(IFormFile)).Select(x => x.Name).First();

                operation.Parameters.Insert(index, new OpenApiParameter()
                {
                    Name = formFileParameterName,
                    In = ParameterLocation.Header,
                    Description = "The file to upload.",
                    Required = true,
                    Schema = new OpenApiSchema
                    {
                        Type = "string"
                    }
                });
            }
        }
    }
}