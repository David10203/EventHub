using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Methods
{
    public class FileValidation
    {

        public static string ValidateFile(IFormFile file)
        {
            var allowedExtensions = new[] { ".pdf" };
            var allowedContentTypes = new[] { "application/pdf" };
            var maxFileSize = 5 * 1024 * 1024;

            if (file.Length == 0)
                return "File is empty";

            if (file.Length > maxFileSize)
                return "File exceeds 5MB";

            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                return "Invalid file extension";

            if (!allowedContentTypes.Contains(file.ContentType))
                return "Invalid file type";

            return null;
        }
    }
}
