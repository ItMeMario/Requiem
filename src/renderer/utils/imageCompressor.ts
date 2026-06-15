/**
 * Compresses a base64 image string by resizing it to fit within maxWidth/maxHeight
 * and applying quality compression, returning a compressed base64 string.
 */
export function compressBase64Image(
  base64Str: string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    // If not a valid base64 image data URI, return as is
    if (!base64Str || !base64Str.startsWith('data:image/')) {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.src = base64Str;
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Don't resize if already smaller than dimensions, but still compress quality
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // We use 'image/jpeg' to enforce quality compression (0.0 to 1.0)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      resolve(base64Str);
    };
  });
}
