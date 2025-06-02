/**
 * Resizes all canvas elements in the canvasArray.
 * If a 'ratio' is provided, the canvas maintains that aspect ratio while fitting
 * within a percentage-defined bounding box of the window.
 * If 'ratio' is NOT provided, the canvas takes the full dimensions defined by
 * 'width_percent' and 'height_percent', effectively adopting their aspect ratio.
 *
 * @param {Object} options - The options for resizing the canvas.
 * @param {HTMLCanvasElement[]} options.canvasArray - An array of canvas elements to resize.
 * @param {number} [options.ratio] - The target aspect ratio (width / height) for the canvas elements.
 * If not specified, the canvas dimensions are determined by width_percent and height_percent of the window.
 * @param {number} [options.height_percent=100] - The maximum height of the canvas as a percentage of the window height.
 * @param {number} [options.width_percent=100] - The maximum width of the canvas as a percentage of the window width.
 */
export function resizeCanvas({ canvasArray, ratio, height_percent = 100, width_percent = 100 }) {
  // Calculate the maximum allowed width and height for the canvas based on percentages
  let maxAllowedWidth = window.innerWidth * (width_percent / 100);
  let maxAllowedHeight = window.innerHeight * (height_percent / 100);

  // Ensure max dimensions are not negative
  maxAllowedWidth = Math.max(0, maxAllowedWidth);
  maxAllowedHeight = Math.max(0, maxAllowedHeight);

  let finalWidth, finalHeight;

  if (ratio === undefined || ratio === null) {
    // Case 1: Ratio is not passed.
    // The canvas takes the dimensions of the bounding box directly.
    // This means its aspect ratio will be maxAllowedWidth / maxAllowedHeight.
    finalWidth = maxAllowedWidth;
    finalHeight = maxAllowedHeight;
  } else {
    // Case 2: Ratio IS passed.
    // The canvas must maintain this 'ratio' while fitting into the bounding box.
    const numRatio = Number(ratio); // Ensure ratio is treated as a number

    if (numRatio === 0) {
      // Target aspect ratio is 0 (width/height = 0), meaning width is 0 (a vertical line).
      finalWidth = 0;
      finalHeight = maxAllowedHeight;
    } else if (!isFinite(numRatio) && numRatio > 0) { // Check for Infinity (numRatio === Infinity)
      // Target aspect ratio is Infinity (width/height = width/0), meaning height is 0 (a horizontal line).
      finalWidth = maxAllowedWidth;
      finalHeight = 0;
    } else if (numRatio < 0 || isNaN(numRatio) || !isFinite(numRatio)) {
      // Invalid ratio (negative, NaN, or other non-finite values not Infinity). Default to 0x0.
      finalWidth = 0;
      finalHeight = 0;
    } else {
      // Ratio is a positive, finite number. Bounding box dimensions determine the fit.
      if (maxAllowedWidth === 0 && maxAllowedHeight === 0) {
        // Bounding box is 0x0 (a point). Canvas must be 0x0.
        finalWidth = 0;
        finalHeight = 0;
      } else if (maxAllowedWidth === 0) {
        // Bounding box is a vertical line (0 x H, where H > 0).
        // A canvas with a positive finite ratio cannot fit with positive area. It becomes 0x0.
        // (Unless ratio was 0, which is handled above).
        finalWidth = 0;
        finalHeight = 0;
      } else if (maxAllowedHeight === 0) {
        // Bounding box is a horizontal line (W x 0, where W > 0).
        // A canvas with a positive finite ratio cannot fit with positive area. It becomes 0x0.
        // (Unless ratio was Infinity, which is handled above).
        finalWidth = 0;
        finalHeight = 0;
      } else {
        // Bounding box has positive width and height. numRatio is positive and finite.
        // This is the standard logic to fit a target aspect ratio into a container.
        const boundingBoxAspectRatio = maxAllowedWidth / maxAllowedHeight;

        if (numRatio > boundingBoxAspectRatio) {
          // Target aspect ratio is wider than the bounding box's aspect ratio.
          // Fit to the width of the bounding box.
          finalWidth = maxAllowedWidth;
          finalHeight = finalWidth / numRatio;
        } else {
          // Target aspect ratio is taller or the same as the bounding box's aspect ratio.
          // Fit to the height of the bounding box.
          finalHeight = maxAllowedHeight;
          finalWidth = finalHeight * numRatio;
        }
      }
    }
  }

  // Ensure final dimensions are not negative, handle potential NaN, and round to integers.
  finalWidth = Math.max(0, Math.round(finalWidth || 0));
  finalHeight = Math.max(0, Math.round(finalHeight || 0));

  // Resize each canvas element in the array
  canvasArray.forEach(canvas => {
    if (canvas instanceof HTMLCanvasElement) {
      canvas.width = finalWidth;
      canvas.height = finalHeight;
    } else {
      console.warn('Item in canvasArray is not an HTMLCanvasElement:', canvas);
    }
  });
}