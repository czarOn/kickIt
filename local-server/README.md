# Private LAN recording server

This experimental server serves KickIt over HTTPS on a selected private IPv4 address, and saves explicitly submitted pose landmarks to `poomse/` on this PC. It does not record video or audio, provide user accounts, or upload data to the internet. Use a trusted home network only. Anyone with access to the Windows recording folder can read its files.

## Start

With the .NET 8 SDK installed, find the PC's private IPv4 address (`Get-NetIPAddress -AddressFamily IPv4` in PowerShell) and run from the repository root, replacing the example address:

```powershell
dotnet run --project .\local-server\KickItLocalServer.csproj -- 192.168.1.25
```

Keep the process running. It prints the HTTPS address, certificate path and SHA-256 fingerprint, access-code file location and recording folder. The access code is regenerated every time the server starts; open the file in `%LOCALAPPDATA%\KickItLocalServer\access-code.txt` on the PC and enter it on each device. Do not send the code to people who should not upload.

## Trust and access

Transfer only `%LOCALAPPDATA%\KickItLocalServer\kickit-root.cer` securely from the PC to each iPhone/iPad. Never transfer the `.pfx` or the certificate password. Verify its SHA-256 fingerprint against the server's displayed fingerprint using a trusted channel. Install the profile in iOS Settings, then enable full trust for this certificate under Settings > General > About > Certificate Trust Settings. Use the printed `https://<PC address>:8443/pose.html` address. A certificate warning must be resolved, not bypassed. Remove the trusted certificate from the device when no longer needed.

Windows Firewall or Wi-Fi client isolation may block access. If necessary, allow inbound TCP port 8443 **only on the private network**, and do not forward the port from a router or expose this service to the public internet. If the PC address changes, restart with the new address. The local CA lasts one year; its private key and password remain in the current Windows user's local app data and must be kept private. Delete those files only when retiring the installation; deleting them changes the CA and requires reinstalling trust on every device.

## Record

Start the camera on the local HTTPS page, enter the current PC access code, and opt into **Automatically save points to this PC**. After capture stops, keep the page open and wait for the saved filename. Alternatively, press **Save points to this PC** manually. If saving fails, the points remain in memory and can still be exported or retried. Automatic saving applies only to the current page; confirm permission before recording another person. The server validates the pose format, limits uploads to 50 MiB, and uses a timestamp and random identifier for each filename. It creates files without overwriting existing ones, including when devices save at the same time. It does not list or delete recordings remotely: inspect and delete `pose-landmarks-*.json` in `poomse/` on the PC. Manual downloads also have distinct timestamped names. The regular GitHub Pages page and its local download option remain available.
