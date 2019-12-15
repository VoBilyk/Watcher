namespace ServiceBus.Shared.Messages
{
    using ServiceBus.Shared.Enums;
    using System;

    public class InstanceNotificationMessage : InstanceMessage
    {
        public InstanceNotificationMessage()
        {
        }

        public InstanceNotificationMessage(string text, InstanceNotifyType type, DateTime createdAt, Guid instanceId) : base(instanceId)
        {
            Text = text;
            Type = type;
            CreatedAt = createdAt;
        }

        public string Text { get; set; }

        public InstanceNotifyType Type { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}