using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;

using SendGrid;
using SendGrid.Helpers.Mail;

using Watcher.Core.Interfaces;

namespace Watcher.Core.Providers
{
    public class EmailProvider : IEmailProvider
    {
        private readonly string _key;

        public EmailProvider(IConfiguration configuration)
        {
            _key = configuration.GetSection("SENDGRID_API_KEY")?.Value;
        }

        public Task<Response> SendMessageOneToOne(string from, string subject, string recepient, string message, string messageHtml) =>
            SendMessage(@from, subject, new List<string> { recepient }, message, messageHtml);
        
        public Task<Response> SendMessageOneToMany(string from, string subject, List<string> recepients, string message, string messageHtml) =>
            SendMessage(@from, subject, recepients, message, messageHtml);

        private async Task<Response> SendMessage(string from, string subject, List<string> recepients, string message, string messageHtml)
        {
            var fromAddress = new EmailAddress(from);
            var recepientsAddresses = recepients.Select(r => new EmailAddress(r)).ToList();

            var msg = MailHelper.CreateSingleEmailToMultipleRecipients(fromAddress, recepientsAddresses, subject, message, messageHtml);

            var client = new SendGridClient(_key);

            var response = await client.SendEmailAsync(msg);
            return response;
        }
    }
}
