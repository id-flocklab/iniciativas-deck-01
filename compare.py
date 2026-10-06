# Compara out/png/NN.png contra reference/NN.png.
# Uso: python3 compare.py [NN ...]  → imprime % de diferencia y arma out/cmp/NN.png (original | render | diff)
import sys, os
from PIL import Image, ImageChops

os.makedirs('out/cmp', exist_ok=True)
nums = [int(a) for a in sys.argv[1:]] or range(1, 29)
for n in nums:
    f = f'{n:02d}.png'
    if not (os.path.exists(f'reference/{f}') and os.path.exists(f'out/png/{f}')):
        continue
    a = Image.open(f'reference/{f}').convert('RGB')
    b = Image.open(f'out/png/{f}').convert('RGB').resize(a.size)
    d = ImageChops.difference(a, b).convert('L')
    score = sum(1 for p in d.getdata() if p > 40) / (a.width * a.height) * 100
    W, H = a.width // 2, a.height // 2
    sheet = Image.new('RGB', (W, H * 3))
    sheet.paste(a.resize((W, H)), (0, 0))
    sheet.paste(b.resize((W, H)), (0, H))
    sheet.paste(d.point(lambda p: 255 if p > 40 else 0).convert('RGB').resize((W, H)), (0, H * 2))
    sheet.save(f'out/cmp/{f}')
    print(f'{n:02d}: {score:5.2f}% px distintos')
