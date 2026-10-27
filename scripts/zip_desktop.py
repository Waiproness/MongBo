from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import sys

root, target = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
assert (root / 'MongBo.exe').is_file(), 'Missing desktop executable'
assert (root / 'resources/app/package.json').is_file(), 'Missing desktop app'
with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
    for file in sorted(root.rglob('*')):
        if file.is_file():
            archive.write(file, root.name + '/' + file.relative_to(root).as_posix())
print(f'Desktop ZIP: {target}')
