using System.Net;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Server.Kestrel.Core;

if (args.Length != 1 || !IPAddress.TryParse(args[0], out var address) ||
    address.AddressFamily != System.Net.Sockets.AddressFamily.InterNetwork || IPAddress.IsLoopback(address))
{
    Console.Error.WriteLine("Usage: dotnet run -- <private IPv4 address>");
    return;
}

var bytes = address.GetAddressBytes();
if (!(bytes[0] == 10 || bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31 || bytes[0] == 192 && bytes[1] == 168))
{
    Console.Error.WriteLine("Only private LAN IPv4 addresses are supported.");
    return;
}

var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".."));
var dataDirectory = Path.Combine(root, "poomse");
var configDirectory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "KickItLocalServer");
Directory.CreateDirectory(configDirectory);
Directory.CreateDirectory(dataDirectory);
var certificatePath = Path.Combine(configDirectory, "kickit-root.cer");
var caPath = Path.Combine(configDirectory, "kickit-root.pfx");
var secretPath = Path.Combine(configDirectory, "certificate-password.txt");
if (!File.Exists(caPath) && !File.Exists(secretPath))
{
    using var caKey = RSA.Create(3072);
    var caRequest = new CertificateRequest("CN=KickIt local recording CA", caKey, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
    caRequest.CertificateExtensions.Add(new X509BasicConstraintsExtension(true, false, 0, true));
    caRequest.CertificateExtensions.Add(new X509KeyUsageExtension(X509KeyUsageFlags.KeyCertSign | X509KeyUsageFlags.CrlSign, true));
    caRequest.CertificateExtensions.Add(new X509SubjectKeyIdentifierExtension(caRequest.PublicKey, false));
    using var newCa = caRequest.CreateSelfSigned(DateTimeOffset.UtcNow.AddMinutes(-5), DateTimeOffset.UtcNow.AddYears(1));
    var password = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
    File.WriteAllText(secretPath, password);
    File.WriteAllBytes(caPath, newCa.Export(X509ContentType.Pfx, password));
}
using var ca = new X509Certificate2(caPath, File.ReadAllText(secretPath), X509KeyStorageFlags.EphemeralKeySet | X509KeyStorageFlags.Exportable);
if (ca.NotAfter.ToUniversalTime() <= DateTime.UtcNow.AddDays(2)) throw new InvalidOperationException("The local CA has expired or is about to expire.");
File.WriteAllBytes(certificatePath, ca.Export(X509ContentType.Cert));
using var serverKey = RSA.Create(2048);
var serverRequest = new CertificateRequest("CN=KickIt local server", serverKey, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
serverRequest.CertificateExtensions.Add(new X509BasicConstraintsExtension(false, false, 0, true));
serverRequest.CertificateExtensions.Add(new X509KeyUsageExtension(X509KeyUsageFlags.DigitalSignature, true));
serverRequest.CertificateExtensions.Add(new X509EnhancedKeyUsageExtension(new OidCollection { new("1.3.6.1.5.5.7.3.1") }, true));
var names = new SubjectAlternativeNameBuilder();
names.AddIpAddress(address);
serverRequest.CertificateExtensions.Add(names.Build());
using var signed = serverRequest.Create(ca, DateTimeOffset.UtcNow.AddMinutes(-4), DateTimeOffset.UtcNow.AddDays(1), RandomNumberGenerator.GetBytes(16));
using var signedWithKey = signed.CopyWithPrivateKey(serverKey);
var serverPassword = Convert.ToHexString(RandomNumberGenerator.GetBytes(16));
using var serverCertificate = new X509Certificate2(signedWithKey.Export(X509ContentType.Pfx, serverPassword), serverPassword);
var token = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
var tokenPath = Path.Combine(configDirectory, "access-code.txt");
File.WriteAllText(tokenPath, token);

var builder = WebApplication.CreateBuilder(args: Array.Empty<string>());
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 50 * 1024 * 1024;
    options.Listen(address, 8443, listen => listen.UseHttps(serverCertificate));
});
var app = builder.Build();
app.Use(async (context, next) =>
{
    context.Response.Headers.CacheControl = "no-store";
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    if (context.Request.Method == "POST")
    {
        var expectedOrigin = $"https://{address}:8443";
        if (context.Request.Headers.Origin != expectedOrigin)
        {
            context.Response.StatusCode = 403;
            return;
        }
    }
    await next();
});

var files = new Dictionary<string, string>(StringComparer.Ordinal)
{
    ["/"] = "index.html", ["/index.html"] = "index.html", ["/pose.html"] = "pose.html",
    ["/game.html"] = "game.html", ["/poomsae.html"] = "poomsae.html",
    ["/motion-tracker.js"] = "motion-tracker.js", ["/poomsae.js"] = "poomsae.js"
};
app.MapGet("/api/local-server", () => Results.Json(new { available = true }));
app.MapGet("/{**path}", (HttpContext context) =>
{
    var path = context.Request.Path.Value ?? "/";
    if (!files.TryGetValue(path, out var file)) return Results.NotFound();
    var type = file.EndsWith(".js", StringComparison.Ordinal) ? "text/javascript; charset=utf-8" : "text/html; charset=utf-8";
    return Results.File(Path.Combine(root, file), type);
});
app.MapPost("/api/recordings", async (HttpContext context) =>
{
    var provided = context.Request.Headers["X-KickIt-Code"].ToString();
    var actual = Encoding.UTF8.GetBytes(provided);
    var expected = Encoding.UTF8.GetBytes(token);
    if (actual.Length != expected.Length || !CryptographicOperations.FixedTimeEquals(actual, expected))
        return Results.Unauthorized();
    if (!context.Request.HasJsonContentType()) return Results.BadRequest(new { error = "Expected JSON." });
    try
    {
        using var document = await JsonDocument.ParseAsync(context.Request.Body, new JsonDocumentOptions { MaxDepth = 16 }, context.RequestAborted);
        var data = document.RootElement;
        if (!ValidRecording(data)) return Results.BadRequest(new { error = "Invalid pose recording." });
        var name = $"pose-landmarks-{DateTime.UtcNow:yyyyMMdd-HHmmss}-{Guid.NewGuid():N}.json";
        var path = Path.Combine(dataDirectory, name);
        var output = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None, 65536, FileOptions.Asynchronous);
        try
        {
            await using (output)
            {
                await JsonSerializer.SerializeAsync(output, data, cancellationToken: context.RequestAborted);
                await output.FlushAsync(context.RequestAborted);
            }
        }
        catch
        {
            File.Delete(path);
            throw;
        }
        return Results.Json(new { file = name });
    }
    catch (JsonException)
    {
        return Results.BadRequest(new { error = "Invalid JSON." });
    }
});

Console.WriteLine($"Local analyzer: https://{address}:8443/pose.html");
Console.WriteLine($"Root certificate (install on each device): {certificatePath}");
Console.WriteLine($"Certificate SHA-256: {Convert.ToHexString(SHA256.HashData(ca.RawData))}");
Console.WriteLine($"Access code file: {tokenPath}");
Console.WriteLine($"Recordings: {dataDirectory}");
await app.RunAsync();

static bool ValidRecording(JsonElement root)
{
    if (root.ValueKind != JsonValueKind.Object || !root.TryGetProperty("format", out var format) || format.ValueKind != JsonValueKind.String ||
        format.GetString() != "kickit-pose-landmarks" || !root.TryGetProperty("version", out var version) ||
        version.ValueKind != JsonValueKind.Number || !version.TryGetInt32(out var v) || v != 1 || !root.TryGetProperty("frames", out var frames) ||
        frames.ValueKind != JsonValueKind.Array || frames.GetArrayLength() is < 2 or > 3600) return false;
    double previous = -1;
    foreach (var frame in frames.EnumerateArray())
    {
        if (frame.ValueKind != JsonValueKind.Object || !frame.TryGetProperty("timeSeconds", out var time) ||
            time.ValueKind != JsonValueKind.Number || !time.TryGetDouble(out var t) || !double.IsFinite(t) ||
            t < 0 || t > 120 || t <= previous || !frame.TryGetProperty("landmarks", out var points) || !ValidPoints(points) ||
            !frame.TryGetProperty("worldLandmarks", out var world) || !ValidPoints(world)) return false;
        previous = t;
    }
    return true;
}

static bool ValidPoints(JsonElement points)
{
    if (points.ValueKind != JsonValueKind.Array || points.GetArrayLength() != 33) return false;
    foreach (var point in points.EnumerateArray())
    {
        if (point.ValueKind != JsonValueKind.Object) return false;
        foreach (var coordinate in new[] { "x", "y", "z" })
            if (!point.TryGetProperty(coordinate, out var value) || value.ValueKind != JsonValueKind.Number ||
                !value.TryGetDouble(out var number) || !double.IsFinite(number)) return false;
        if (point.TryGetProperty("visibility", out var visibility) &&
            (visibility.ValueKind != JsonValueKind.Number || !visibility.TryGetDouble(out var n) || !double.IsFinite(n) || n < 0 || n > 1)) return false;
    }
    return true;
}
