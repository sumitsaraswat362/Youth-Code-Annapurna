from PIL import Image
import sys

img_path = sys.argv[1]
out_path = sys.argv[2]

img = Image.open(img_path).convert("RGBA")
data = img.getdata()

new_data = []
for item in data:
    # If pixel is very close to white
    if item[0] > 240 and item[1] > 240 and item[2] > 240:
        new_data.append((0, 0, 0, 255)) # turn it black
    else:
        new_data.append(item)

img.putdata(new_data)
img.save(out_path)
print("Done processing iPhone image.")
