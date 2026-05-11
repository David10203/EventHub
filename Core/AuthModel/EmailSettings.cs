namespace Core.AuthModel
{
    public class EmailSettings
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public bool UseSsl { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string FromAddress { get; set; }
        public string FromName { get; set; }
    }
}
