/**
 * Compress an image file using Canvas API.
 * Resizes to maxWidth/maxHeight while maintaining aspect ratio,
 * then outputs as JPEG at the given quality.
 *
 * @param {File} file - The image file to compress
 * @param {Object} options
 * @param {number} options.maxWidth - Max width in px (default 1200)
 * @param {number} options.maxHeight - Max height in px (default 1200)
 * @param {number} options.quality - JPEG quality 0-1 (default 0.7)
 * @returns {Promise<string>} - Base64 data URL of compressed image
 */
export const compressImage = (file, options = {}) => {
    const { maxWidth = 1200, maxHeight = 1200, quality = 0.7 } = options;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;

                // Calculate new dimensions maintaining aspect ratio
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                // Draw to canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Output as JPEG data URL
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
