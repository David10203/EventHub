namespace IAProject.Middlewares
{
    public class checkonJWTToken
    {
        private readonly RequestDelegate _next;
        
        public checkonJWTToken(RequestDelegate next)
        {
            _next = next;
           
        }
        public async Task Invoke(HttpContext context)
        {

            var path = context.Request.Path;
            if (path.StartsWithSegments("/hangfire") || path.StartsWithSegments("/swagger") || path.StartsWithSegments("/api/Users/register") || path.StartsWithSegments("/api/Users/login") || path.StartsWithSegments("/api/TestDeleteLogs"))
            {
                await _next(context);
                return;
            }

            var token = context.Request.Headers["Authorization"].ToString();

            if (token.StartsWith("Bearer"))
            {



                await _next(context);
                return;
            }

            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("{\"error\": \"unauthorized\"}");
        }

    }
}
