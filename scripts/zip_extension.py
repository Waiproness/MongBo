from pathlib import Path
import sys
from zipfile import ZipFile, ZIP_DEFLATED

root, target = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
assert (root / 'manifest.json').is_file(), 'Expected extension manifest'
assert not (root / '_headers').exists(), 'Cloudflare headers must not enter the extension'
assert not (root / '_redirects').exists(), 'Cloudflare redirects must not enter the extension'
assert not (root / 'downloads').exists(), 'Downloads must not enter the extension'
with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
    for file in sorted(root.rglob('*')):
        if file.is_file():
            archive.write(file, file.relative_to(root).as_posix())
print(f'Extension ZIP: {target}')
