"""
Remove dark/black backgrounds from device mockup images,
making those pixels fully transparent. Using aggressive threshold.
"""
from PIL import Image
import numpy as np

def remove_dark_background(input_path, output_path, threshold=75):
    """
    Convert all pixels where R, G, and B are ALL below threshold
    to fully transparent. Higher threshold = more aggressive removal.
    """
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Core dark area: make fully transparent
    dark_mask = (r < threshold) & (g < threshold) & (b < threshold)
    data[dark_mask, 3] = 0
    
    # Smooth edge transition for anti-aliasing
    edge_high = threshold + 25
    edge_mask = (
        ~dark_mask &
        (r < edge_high) & (g < edge_high) & (b < edge_high)
    )
    brightness = np.maximum(np.maximum(r, g), b).astype(float)
    edge_alpha = ((brightness - threshold) / (edge_high - threshold) * 255).clip(0, 255).astype(np.uint8)
    data[edge_mask, 3] = edge_alpha[edge_mask]
    
    result = Image.fromarray(data)
    result.save(output_path, "PNG")
    print(f"Done: {input_path} -> {output_path} (threshold={threshold})")

if __name__ == "__main__":
    images = [
        "public/images/macbook_hardware.png",
        "public/images/ipad_hardware.png",
        "public/images/iphone_hardware.png",
    ]
    for path in images:
        remove_dark_background(path, path)
    print("All done!")
