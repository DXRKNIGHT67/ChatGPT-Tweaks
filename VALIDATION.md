# Validation

- `npm ci` completed with pinned dependencies and verification enabled. Electron downloads used the existing HTTPS proxy and a writable cache.
- `npm test`: 2 tests passed. Catalog contains 60 unique current-user registry settings, valid types, and opt-in recommendation exclusions.
- JavaScript syntax checks passed for main, preload, and renderer.
- Chromium UI smoke checks passed with **mock Windows IPC**: supplied Ryzen/RTX hardware rendering, select all 60, search filtering, review before mutation, cancellation, recommended application, and network result rendering. The screenshot uses this mock hardware, not a scan of the Linux build host.
- Packaged `app.asar` was checked for the current backend, catalog, scanner, preload, and renderer.

## Required Windows verification before public release

The Linux build host cannot verify Windows CIM scanning, registry effects, or restoration. On a Windows test account, verify actual scanned CPU/GPU/RAM/storage, apply one setting with an absent registry value and one with an existing value, repeat apply, restore, and confirm the original value/type or absence. Check failure reporting and sign-out/restart behavior. Test the portable executable and the Windows-built installer. Measure game FPS and frame times separately; no performance claim has been validated.

The Linux NSIS installer attempt failed because Wine was unavailable. Do not use its intermediate setup executable. The repository includes a Windows GitHub Actions installer build and a Linux-compatible portable Windows build command. Public builds should be signed by their publisher.

Portable Windows build completed successfully. The finished PE executable was checked and SHA256SUMS.txt generated. It has not been launched on Windows.
