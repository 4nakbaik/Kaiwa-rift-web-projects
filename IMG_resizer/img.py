from PIL import Image
import os

input_folder = r"C:\Users\Lenovo\Documents\WEB projek\KotobaEnjoyer\IMG_resizer\sample"
output_folder = r"C:\Users\Lenovo\Documents\WEB projek\KotobaEnjoyer\IMG_resizer\output_images"

os.makedirs(output_folder, exist_ok=True)

for filename in os.listdir(input_folder):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
        img_path = os.path.join(input_folder, filename)
        img = Image.open(img_path)

        resized_img = img.resize((600, 400), Image.LANCZOS)  

        output_path = os.path.join(output_folder, filename)
        resized_img.save(output_path, quality=95)  

        print(f" {filename} sipp, berhasil")

print("\n beres")