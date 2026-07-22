import base64, pathlib

base = pathlib.Path(r'c:/Users/Administrator/WorkBuddy/2026-07-14-09-19-47/webapp')
files = ['worldmap_app.js', 'wm_chk.html']
paths = {
    'LoLGrab': 'assets/cursors/LoLGrab.png',
    'LoGGrabbing': 'assets/cursors/LoGGrabbing.png',
}
data = {k: "data:image/png;base64," + base64.b64encode((base / p).read_bytes()).decode()
        for k, p in paths.items()}

for f in files:
    fp = base / f
    s = fp.read_text(encoding='utf-8')
    s2 = s.replace("'assets/cursors/LoLGrab.png'", "'" + data['LoLGrab'] + "'") \
          .replace("'assets/cursors/LoGGrabbing.png'", "'" + data['LoGGrabbing'] + "'")
    if s2 != s:
        fp.write_text(s2, encoding='utf-8')
        print('updated', f)
    else:
        print('no change', f)
