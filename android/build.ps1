# Compila el APK "Pío Vuelo" sin Gradle: aapt2 + javac + d8 + zipalign + apksigner
# Requiere: JDK 17+ instalado y Android SDK (platform-tools, platforms;android-34, build-tools;34.0.0)
$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptDir
$outDir = Join-Path $root 'dist'
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

# ------ rutas de herramientas ------
$jdk = $env:JAVA_HOME
if (-not $jdk -or -not (Test-Path (Join-Path $jdk 'bin\javac.exe'))) {
  if (Test-Path "$env:USERPROFILE\jdk17\extracted") {
    $jdk = (Get-ChildItem "$env:USERPROFILE\jdk17\extracted" -Directory | Select-Object -First 1).FullName
  } else {
    throw 'No se encontró el JDK. Define JAVA_HOME o instala JDK 17.'
  }
}
$sdk = $env:ANDROID_HOME
if (-not $sdk) {
  if (Test-Path "$env:USERPROFILE\AndroidSDK") { $sdk = "$env:USERPROFILE\AndroidSDK" } else { throw 'No se encontró el Android SDK. Define ANDROID_HOME.' }
}
$buildTools = Join-Path $sdk 'build-tools\34.0.0'
$platform = Join-Path $sdk 'platforms\android-34'
$androidJar = Join-Path $platform 'android.jar'
foreach ($f in @("$buildTools\aapt2.exe", "$buildTools\d8.bat", "$buildTools\zipalign.exe", "$buildTools\apksigner.bat", $androidJar)) {
  if (-not (Test-Path $f)) { throw "Falta: $f" }
}
$env:JAVA_HOME = $jdk
$env:Path = "$jdk\bin;$env:Path"

$work = Join-Path $scriptDir '.build'
if (Test-Path $work) { Remove-Item $work -Recurse -Force }
New-Item -ItemType Directory -Path $work -Force | Out-Null

Write-Host '== 1/6 Copiando assets del juego =='
$assets = Join-Path $scriptDir 'assets'
if (Test-Path $assets) { Remove-Item $assets -Recurse -Force }
New-Item -ItemType Directory -Path $assets -Force | Out-Null
Copy-Item (Join-Path $root 'index.html') $assets
Copy-Item (Join-Path $root 'manifest.webmanifest') $assets
Copy-Item (Join-Path $root 'sw.js') $assets
Copy-Item -Recurse (Join-Path $root 'css') $assets
Copy-Item -Recurse (Join-Path $root 'js') $assets
Copy-Item -Recurse (Join-Path $root 'icons') $assets

Write-Host '== 2/6 Comprimiendo recursos (aapt2 compile) =='
$resZip = Join-Path $work 'res.zip'
$ea = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
& "$buildTools\aapt2.exe" compile --dir (Join-Path $scriptDir 'res') -o $resZip 2>$null
if ($LASTEXITCODE -ne 0) { $ErrorActionPreference = $ea; throw 'aapt2 compile falló' }
$ErrorActionPreference = $ea

Write-Host '== 3/6 Vinculando recursos (aapt2 link) =='
$baseApk = Join-Path $work 'base.apk'
$ea = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
& "$buildTools\aapt2.exe" link -o $baseApk -I $androidJar --manifest (Join-Path $scriptDir 'AndroidManifest.xml') -R $resZip --auto-add-overlay 2>$null
if ($LASTEXITCODE -ne 0) { $ErrorActionPreference = $ea; throw 'aapt2 link falló' }
$ErrorActionPreference = $ea

Write-Host '== 4/6 Compilando Java a classes.dex =='
$genSrc = Join-Path $work 'src-gen'
New-Item -ItemType Directory -Path (Join-Path $genSrc 'com\piovuelo\game') -Force | Out-Null
Copy-Item (Join-Path $scriptDir 'src\com\piovuelo\game\MainActivity.java') (Join-Path $genSrc 'com\piovuelo\game')
$objDir = Join-Path $work 'obj'
New-Item -ItemType Directory -Path $objDir -Force | Out-Null
$javaFile = Join-Path $genSrc 'com\piovuelo\game\MainActivity.java'
$ea = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
& "$jdk\bin\javac.exe" -source 8 -target 8 -bootclasspath $androidJar -Xlint:-options -d $objDir $javaFile 2>$null
if ($LASTEXITCODE -ne 0) { $ErrorActionPreference = $ea; throw 'javac falló' }
$classesJar = Join-Path $work 'classes.jar'
& "$jdk\bin\jar.exe" cf $classesJar -C $objDir . 2>$null
if ($LASTEXITCODE -ne 0) { $ErrorActionPreference = $ea; throw 'jar falló' }
$dexDir = Join-Path $work 'dex'
New-Item -ItemType Directory -Path $dexDir -Force | Out-Null
& "$buildTools\d8.bat" --release --lib $androidJar --min-api 24 --output $dexDir $classesJar 2>$null
if ($LASTEXITCODE -ne 0) { $ErrorActionPreference = $ea; throw 'd8 falló' }
$ErrorActionPreference = $ea

Write-Host '== 5/6 Empaquetando assets + dex =='
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($baseApk, [System.IO.Compression.ZipArchiveMode]::Update)
function Add-ZipEntry([string]$entryName, [string]$filePath) {
  $entry = $zip.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
  $es = $entry.Open()
  try {
    $fs = [System.IO.File]::OpenRead($filePath)
    try { $fs.CopyTo($es) } finally { $fs.Dispose() }
  } finally { $es.Dispose() }
}
$dex = Join-Path $dexDir 'classes.dex'
Add-ZipEntry 'classes.dex' $dex
Get-ChildItem $assets -Recurse -File | ForEach-Object {
  $rel = $_.FullName.Substring($assets.Length + 1).Replace('\', '/')
  Add-ZipEntry ("assets/" + $rel) $_.FullName
}
$zip.Dispose()

Write-Host '== 6/6 Alineando y firmando =='
$aligned = Join-Path $work 'aligned.apk'
$ea = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
& "$buildTools\zipalign.exe" -f 4 $baseApk $aligned 2>$null
if ($LASTEXITCODE -ne 0) { $ErrorActionPreference = $ea; throw 'zipalign falló' }

$keystore = Join-Path $scriptDir 'debug.keystore'
if (-not (Test-Path $keystore)) {
  & "$jdk\bin\keytool.exe" -genkeypair -v -keystore $keystore -storepass android -alias piovuelo -keypass android -dname "CN=Pio Vuelo, O=PioVuelo, C=US" -keyalg RSA -keysize 2048 -validity 10000 2>$null
  if ($LASTEXITCODE -ne 0) { $ErrorActionPreference = $ea; throw 'keytool falló' }
}
$finalApk = Join-Path $outDir 'PioVuelo.apk'
& "$buildTools\apksigner.bat" sign --ks $keystore --ks-pass pass:android --key-pass pass:android --out $finalApk $aligned 2>$null
if ($LASTEXITCODE -ne 0) { $ErrorActionPreference = $ea; throw 'apksigner falló' }
$ErrorActionPreference = $ea

Write-Host ''
Write-Host "APK generado: $finalApk"
& "$buildTools\apksigner.bat" verify --print-certs $finalApk 2>$null
Write-Host 'Build completo.'