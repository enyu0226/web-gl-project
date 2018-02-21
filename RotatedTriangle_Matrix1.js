// RotatedTriangle_Matrix.js (c) matsuda
// Vertex shader program

//vec4 is a 4 float value. In JavaScript you could think of it something like 
//a_position = {x: 0, y: 0, z: 0, w: 0}
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_xformMatrix;\n' +
  'uniform mat4 u_yformMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_xformMatrix * u_yformMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(0.95,0.538,0.599,1.0);\n' +
  '}\n';
//ebGL will now render that triangle. For every pixel it is about to draw WebGL will call our fragment shader.
//Our fragment shader just sets gl_FragColor to a,b,c,d. Since the Canvas is an 8bit per channel canvas 
//that means WebGL is going to write the values 255*[a, b, c, d] into the canvas.

// The rotation angle
var ANGLE = 90.0;
// var randomAngle = Math.random() * 180;
// var ANGLE = randomAngle;

var Sx = 1.0, Sy = 1.0, Sz = 1.0;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
 
  // Write the positions of vertices to a vertex shader
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  // Create a rotation matrix
  var radian = Math.PI * ANGLE / 180.0; // Convert to radians
  var cosB = Math.cos(radian), sinB = Math.sin(radian);
  
  //var randomShear=-1+Math.random()*2

  var VerticalShear= 0.0;
  var HorizontalShear=1.0;
  //var HorizontalShear=randomShear;
  // Note: WebGL is column major order
  var xformMatrix = new Float32Array([
     cosB, sinB, 0.0, 0.0,
    -sinB, cosB, 0.0, 0.0,
      0.0,  0.0, 0.0, 0.0,
      0.0,  0.0, 0.0, 1.0
  ]);

  var yformMatrix = new Float32Array([
      Sx,  VerticalShear, 0.0, 0.0,
      HorizontalShear,  Sy, 0.0, 0.0,
      0.0,  0.0, Sz, 0.0,
      0.0,  0.0, 0.0, 1.0
  ]);

  // Pass the rotation matrix to the vertex shader
  var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
  if (!u_xformMatrix) {
    console.log('Failed to get the storage location of u_xformMatrix');
    return;
  }
  gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);



  var u_yformMatrix = gl.getUniformLocation(gl.program, 'u_yformMatrix');
  if (!u_yformMatrix) {
    console.log('Failed to get the storage location of u_yformMatrix');
    return;
  }
  gl.uniformMatrix4fv(u_yformMatrix, false, yformMatrix);


  // Specify the color for clearing <canvas>
  gl.clearColor(1.0,0.776,0.598,1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the triangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
  //gl.drawArrays(primitiveType, offset, count);
  //Since  count is 3 this will execute our vertex shader 3 times
} //Because we set primitiveType to gl.TRIANGLES, 
  //each time our vertex shader is run 3 times WebGL will draw a triangle based on the 3 values we set gl_Position to. 
  //No matter what size our canvas is those values are in clip space coordinates that go from -1 to 1 in each direction.

function initVertexBuffers(gl) {
  var vertices = new Float32Array([
    0, 0.5,  
    -0.5, -0.5,  
    0.5, -0.5
  ]);

  //new Float32Array(positions) creates a new array of 32bit floating point numbers and copies the values from 
  //vertices.gl.bufferData then copies that data to the vertexBuffer on the GPU
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  //WebGL lets us manipulate many WebGL resources on global bind points. 
  //You can think of bind points as internal global variables inside WebGL. 
  //First you bind a resource to a bind point. 
  //Then, all other functions refer to the resource through the bind point. 
  //We proceed to bind the vertexBuffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  //gl.STATIC_DRAW is a hint to WebGL about how we'll use the data. 
  //WebGL can try to use that hint to optimize certain things. gl.STATIC_DRAW tells WebGL we are not likely to change this data much.
  

  //In this case our only input to our GLSL program is a_position which is an attribute.
  //The first thing we should do is look up the location of the attribute for the program we just created
  //Attributes get their data from buffers so we need to create a buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  // we specify how to pull the data out
  //A hidden part of gl.vertexAttribPointer is that it binds the current ARRAY_BUFFER to the attribute. 
  //In other words now this attribute is bound to vectexBuffer. 
  //That means we're free to bind something else to the ARRAY_BUFFER bind point. 
  //The attribute will continue to use vertexBuffer.

  //Because our vertex shader is simply copying our vertexBuffer values to gl_Position the triangle will be drawn at clip space coordinates
  //of the vertexBuffer
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  // we turn the attribute on
  gl.enableVertexAttribArray(a_Position);

  return n;
}

