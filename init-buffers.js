function initBuffers(gl)
{
    const positionBuffer = initPositionBuffer(gl);

    return {
        position: positionBuffer,
    };
}

function initPositionBuffer(gl) {
    // Create a buffer for the square's positions
    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer operation to from here out
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of position for the square
    const position = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

    // Now pass the list of position into WebGL to build the shape
    // We do this by creating a Float32Array from the JavaScript array, then use it to fill the current buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return positionBuffer;
}

export { initBuffers };