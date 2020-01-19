using SendGrid;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Watcher.Core.Interfaces
{
    public interface IEmailProvider
    {
        Task<Response> SendMessageOneToOne(string from, string subject, string recepient, string message, string messageHtml);
        Task<Response> SendMessageOneToMany(string from, string subject, List<string> recepients, string message, string messageHtml);
    }
}
