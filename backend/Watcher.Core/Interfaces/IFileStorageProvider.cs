﻿using System.Threading.Tasks;

namespace Watcher.Core.Interfaces
{
    using Microsoft.AspNetCore.Http;
    using System;
    using Watcher.Common.Enums;

    public interface IFileStorageProvider
    {
        Task<string> UploadFormFileAsync(IFormFile formFile);

        Task<string> UploadFormFileAsync(IFormFile formFile, OperatingSystems system);

        Task<string> UploadFormFileWithNameAsync(IFormFile formFile);

        Task<string> UploadHtmlFileAsync(string htmlString, Guid reportId);

        Task<string> UploadFileAsync(string path, string containerName = "watcher");

        Task<string> UploadFileFromStreamAsync(string url, string containerName = "watcher");
        Task<string> UploadFileBase64Async(string base64string, string imageType = "png", string containerName = "watcher");
        Task DeleteFileAsync(string UriPath);
        Task<bool> IsExist(string path);
    }
}
