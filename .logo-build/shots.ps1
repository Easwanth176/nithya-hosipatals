$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$o = Join-Path $PSScriptRoot ""
foreach ($ms in 1500, 3400, 5000, 9500) {
  & $edge --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$o\edge-t$ms" --virtual-time-budget=$ms --window-size=1440,900 --screenshot="$o\t-$ms.png" "http://127.0.0.1:3000/?lang=en" 2>$null | Out-Null
}
node -e "const {PNG}=require('pngjs');const fs=require('fs');const ts=[1500,3400,5000,9500];const W=620,H=520,X=780,Y=150;const d=new PNG({width:W*2,height:H*2});ts.forEach((t,i)=>{const s=PNG.sync.read(fs.readFileSync('.logo-build/t-'+t+'.png'));PNG.bitblt(s,d,X,Y,W,H,(i%2)*W,Math.floor(i/2)*H);});fs.writeFileSync('.logo-build/t-grid.png',PNG.sync.write(d));"
