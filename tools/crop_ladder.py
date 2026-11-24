"""Web version of the classifier ladder: keep the accuracy row and the rung labels (the full figure stays linked)."""
import sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
W, H = im.size
top = im.crop((0, 0, W, int(0.318 * H)))          # title + accuracy row
labels = im.crop((0, int(0.885 * H), W, H))       # rung names under the bottom row
out = Image.new("RGB", (W, top.height + labels.height), "white")
out.paste(top, (0, 0)); out.paste(labels, (0, top.height))
out.save(dst)
print(dst, out.size)
