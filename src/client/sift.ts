export function generateBaseImage(image: ImageData)
{
    const text = document.getElementById('text') as HTMLElement
    const sigma = 1.6
    const assumedBlur = 0.5

    // Upscale image by [2 2] with linear interpolation
    //const sigmaDiff = Math.sqrt(Math.max(sigma * sigma) - ((2 * assumedBlur) * (2 * assumedBlur)), 0.01)
}

export function ScaleImage(inputImage: ImageData, scaleFactor: number) : ImageData
{
    const originalWidth = inputImage.width
    const originalHeight = inputImage.height

    // Get new image dimensions
    const newWidth = originalWidth * scaleFactor
    const newHeight = originalHeight * scaleFactor

    // Create an image with the new dimensions
    var outputImage = new ImageData(newWidth, newHeight)

    for (let i = 0; i < outputImage.data.length; i += 4)
    {
        // Get 2D pixel positions
        const x = Math.floor(i / 4) % newWidth
        const y = Math.floor(Math.floor(i / 4) / newWidth)

        outputImage.data[i] = BilinearInterpolation(x, y, scaleFactor, inputImage, 0)
        outputImage.data[i+1] = BilinearInterpolation(x, y, scaleFactor, inputImage, 1)
        outputImage.data[i+2] = BilinearInterpolation(x, y, scaleFactor, inputImage, 2)
        outputImage.data[i+3] = BilinearInterpolation(x, y, scaleFactor, inputImage, 3)
    }

    return outputImage
}

export function BilinearInterpolation(x: number, y: number, scaleFactor: number, inputImage: ImageData, rgbOffset: number) : number
{
    // Get pixel position in original image
    const originalX = x / scaleFactor
    const originalY = y / scaleFactor

    const originalWidth = inputImage.width
    const originalHeight = inputImage.height

    // Get the neighbouring pixel 2D coords
    const x1 = Math.min(Math.floor(originalX), originalWidth - 1)
    const x2 = Math.min(Math.ceil(originalX), originalWidth - 1)
    const y1 = Math.min(Math.floor(originalY), originalHeight - 1)
    const y2 = Math.min(Math.ceil(originalY), originalHeight - 1)

    // Get values of neighboring pixels
    const q11 = inputImage.data[x1 * 4 + y1 * 4 * originalWidth + rgbOffset]
    const q12 = inputImage.data[x2 * 4 + y1 * 4 * originalWidth + rgbOffset]
    const q21 = inputImage.data[x1 * 4 + y2 * 4 * originalWidth + rgbOffset]
    const q22 = inputImage.data[x2 * 4 + y2 * 4 * originalWidth + rgbOffset]

    // Interpolate along horizontal axis
    var p1 = (x2 - originalX) * q11 + (originalX - x1) * q12
    var p2 = (x2 - originalX) * q21 + (originalX - x1) * q22

    if (x1 === x2)
    {
        p1 = q11
        p2 = q22
    }

    // Interpolate along vertical axis
    var p = Math.round((y2 - originalY) * p1 + (originalY - y1) * p2)

    return p
}