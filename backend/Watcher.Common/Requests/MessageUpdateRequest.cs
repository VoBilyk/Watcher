﻿namespace Watcher.Common.Requests
{
    public class MessageUpdateRequest
    {
        public MessageUpdateRequest() { }

        public string Text { get; set; }

        public bool WasRead { get; set; }
    }
}
