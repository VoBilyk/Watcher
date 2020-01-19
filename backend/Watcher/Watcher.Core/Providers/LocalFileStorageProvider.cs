using System;
using System.IO;
using System.Threading.Tasks;
using Watcher.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Watcher.Common.Enums;
using Watcher.Common.Helpers.Utils;

namespace Watcher.Core.Providers
{
    public class LocalFileStorageProvider : IFileStorageProvider
    {
        private readonly string rootUrl;

        public LocalFileStorageProvider(IConfiguration configuration)
        {
            rootUrl = configuration.GetValue<string>("ClientUrl");
        }

        public async Task<string> UploadFormFileAsync(IFormFile formFile)
        {
            var fileName = Guid.NewGuid() + Path.GetExtension(formFile.FileName);
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", fileName);

            using (var stream = new FileStream(path, FileMode.Create))
            {
                await formFile.CopyToAsync(stream);
            }

            return path;
        }

        public async Task<string> UploadFormFileAsync(IFormFile formFile, OperatingSystems system)
        {
            var fileName = Guid.NewGuid() + Path.GetExtension(formFile.FileName);
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", fileName);

            using (var stream = new FileStream(path, FileMode.Create))
            {
                await formFile.CopyToAsync(stream);
            }

            return path;
        }

        public Task<string> UploadHtmlFileAsync(string htmlString, Guid reportId)
        {
            var folderPath = GetFolderPath("documents");

            string filename = Guid.NewGuid().ToString() + ".html";

            File.WriteAllText(Path.Combine(folderPath, filename), htmlString);
            var file = new FileInfo(folderPath + @"\\" + filename);

            return Task.FromResult(ConvertToUri(file.FullName));
        }

        public Task<string> UploadFileAsync(string path, string containerName = "watcher")
        {
            try
            {
                var folderPath = GetImageFolderPath();
                var file = new FileInfo(path);

                if (!file.Exists)
                {
                    throw new ArgumentNullException("Invalid path");
                }

                string filename = Guid.NewGuid().ToString() + Path.GetExtension(path);

                var fileInfo = file.CopyTo(folderPath + @"\\" + filename);

                string newPath = fileInfo.FullName;

                return Task.FromResult(ConvertToUri(newPath));
            }
            catch (Exception ex)
            {
                return Task.FromException<string>(ex);
            }
        }

        public Task<string> UploadFileFromStreamAsync(string url, string containerName = "watcher")
        {
            var imagePath = FileHelpers.DownloadImageFromUrl(url);
            return Task.FromResult(ConvertToUri(imagePath));
        }

        public Task DeleteFileAsync(string path)
        {
            try
            {
                path = ConvertToAbsolutePath(path);

                var file = new FileInfo(path);
                if (!file.Exists)
                {
                    throw new ArgumentNullException("Invalid path");
                }

                file.Delete();
                return Task.FromResult<object>(null);
            }
            catch (Exception ex)
            {
                return Task.FromException<object>(ex);
            }
        }

        private string ConvertToUri(string path)
        {
            var uri1 = new Uri(path);
            var uri2 = new Uri(new FileInfo(path).Directory.FullName);
            var relativeUri = uri2.MakeRelativeUri(uri1);
            return $"{rootUrl}/{relativeUri.ToString()}";
        }

        private string ConvertToAbsolutePath(string relativePath)
        {
            string parent = Directory.GetCurrentDirectory();
            while (new DirectoryInfo(parent).Name != "Watcher")
            {
                parent = Directory.GetParent(parent).FullName;
                if (parent == Directory.GetDirectoryRoot(parent))
                {
                    throw new ArgumentNullException("Wrong relative path");
                }
            }
            parent += @"\wwwroot\" + relativePath;
            return parent;
        }

        public Task<string> UploadFileBase64Async(string base64string, string imageType = "png", string containerName = "watcher")
        {
            try
            {
                string base64 = base64string.Split(',')[1];

                var imagesPath = GetImageFolderPath();

                string filename = Guid.NewGuid().ToString() + ".png";

                File.WriteAllBytes(Path.Combine(imagesPath, filename), Convert.FromBase64String(base64));
                var file = new FileInfo(imagesPath + @"\\" + filename);

                string filePath = file.FullName;

                return Task.FromResult(ConvertToUri(filePath));
            }
            catch (Exception ex)
            {
                return Task.FromException<string>(ex);
            }
        }

        public Task<bool> IsExist(string path)
        {
            try
            {
                var file = new FileInfo(GetImageFolderPath() + @"\\" + path);
                return Task.FromResult(file.Exists);
            }
            catch (Exception ex)
            {
                return Task.FromException<bool>(ex);
            }
        }

        public async Task<string> UploadFormFileWithNameAsync(IFormFile formFile)
        {
            var path = Path.Combine(GetImageFolderPath(), formFile.FileName);

            using (var stream = new FileStream(path, FileMode.Create))
            {
                await formFile.CopyToAsync(stream);
            }

            return path;
        }

        private string GetFolderPath(string folder)
        {
            string parent = Directory.GetCurrentDirectory();
            while (new DirectoryInfo(parent).Name != "Watcher")
            {
                parent = Directory.GetParent(parent).FullName;
            }

            var directory = new DirectoryInfo(Path.Combine(parent, "wwwroot", folder));
            if (!directory.Exists)
            {
                directory.Create();
            }

            return directory.FullName;
        }

        private string GetImageFolderPath() => GetFolderPath("images");
    }
}
