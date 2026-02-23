; Quanta Programming Language Installer Script (Inno Setup)
; Generates a professional Windows installer for Quanta

#define MyAppName "Quanta Language"
#define MyAppVersion "1.0"
#define MyAppPublisher "Rohan Kumar Rawat / VoidPanel"
#define MyAppExeName "quanta.exe"

[Setup]
; Basic Information
AppId={{YOUR-UNIQUE-GUID-HERE}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName=C:\Quanta
DefaultGroupName={#MyAppName}
OutputDir=.\Output
OutputBaseFilename=Quanta_Installer_v{#MyAppVersion}
Compression=lzma2/ultra
SolidCompression=yes

; User Interface Optimizations
; Enable modern Wizard styling
WizardStyle=modern
; If you have custom images, uncomment and point to them
WizardImageFile=installer_left_banner.bmp
; WizardSmallImageFile=installer_top_right.bmp
SetupIconFile=quanta_icon.ico

; Add the EULA (End User License Agreement)
LicenseFile=..\LICENSE.txt

; Only require admin privileges if installing to Program Files
PrivilegesRequired=admin

; Specify that this installer can be run on 64-bit systems
ArchitecturesInstallIn64BitMode=x64

; Tells Windows to reload environment variables so PATH changes take effect immediately
ChangesEnvironment=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "..\build\quanta.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\docs\*"; DestDir: "{app}\docs"; Flags: ignoreversion recursesubdirs createallsubdirs
; Bundle the GCC compiler so users don't need to install anything extra
Source: ".\compiler\*"; DestDir: "{app}\compiler"; Flags: ignoreversion recursesubdirs createallsubdirs
; Bundle the Quanta standard library source so it can be linked
Source: "..\src\quanta_lib.c"; DestDir: "{app}\src"; Flags: ignoreversion
; Bundle Quanta Studio
Source: "..\quanta-editor\release\win-unpacked\*"; DestDir: "{app}\Quanta Studio"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName} Documentation"; Filename: "{app}\docs\The_Quanta_Programming_Language.md"
Name: "{group}\Quanta Studio"; Filename: "{app}\Quanta Studio\Quanta Studio.exe"
Name: "{commondesktop}\Quanta Studio"; Filename: "{app}\Quanta Studio\Quanta Studio.exe"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"

[Registry]
; Add Quanta to system PATH
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; \
    ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; \
    Check: NeedsAddPath(ExpandConstant('{app}'))

; Add bundled compiler to system PATH
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; \
    ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}\compiler"; \
    Check: NeedsAddPath(ExpandConstant('{app}\compiler'))

[Code]
// Helper function to check if the app directory is already in the system PATH
function NeedsAddPath(Param: string): boolean;
var
  OrigPath: string;
begin
  if not RegQueryStringValue(HKEY_LOCAL_MACHINE, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'Path', OrigPath) then
  begin
    Result := True;
    exit;
  end;
  // Look for the path with leading and trailing semicolon
  // Pos() returns > 0 if found
  Result := Pos(';' + Param + ';', ';' + OrigPath + ';') = 0;
end;
