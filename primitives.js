// cube
const positions = new Float32Array([
  -1, -1, -1,  // 0
   1, -1, -1,  // 1
   1,  1, -1,  // 2
  -1,  1, -1,  // 3
  -1, -1,  1,  // 4
   1, -1,  1,  // 5
   1,  1,  1,  // 6
  -1,  1,  1   // 7
]);

const colors = new Float32Array([
  1,0,0,  0,1,0,  0,0,1, 1,1,0, 1,0,1, 0,1,1, 1,1,0, 1,0,1
]);


const indices = new Uint16Array([
  // Front
  4, 5, 6,   4, 6, 7,
  // Back
  1, 0, 3,   1, 3, 2,
  // Top
  3, 7, 6,   3, 6, 2,
  // Bottom
  0, 1, 5,   0, 5, 4,
  // Right
  1, 2, 6,   1, 6, 5,
  // Left
  0, 4, 7,   0, 7, 3,
]);

// #1: builds a ball shape by walking around it in a grid of latitude/longitude
// steps and placing a point at each step. Giving rx/ry/rz different values
// stretches the ball on that axis, so the same function makes a round ball
// or a stretched one.
function makeBall(rx, ry, rz, uSteps, vSteps, baseColor) {
  const positions = [];
  const colors = [];
  const indices = [];

  // #1: a fixed direction to treat as "where the light comes from", so each
  // point can be shaded brighter or darker instead of one flat color.
  const lightX = 0.4082, lightY = 0.4082, lightZ = 0.8165;

  for (let i = 0; i <= vSteps; i++) {
    const v = i * Math.PI / vSteps;
    const sinv = Math.sin(v);
    const cosv = Math.cos(v);
    for (let j = 0; j <= uSteps; j++) {
      const u = j * 2 * Math.PI / uSteps;
      const sinu = Math.sin(u);
      const cosu = Math.cos(u);
      const x = cosu * sinv;
      const y = cosv;
      const z = sinu * sinv;
      positions.push(rx * x, ry * y, rz * z);

      // #1: x,y,z here already point straight out from the center, so I can
      // reuse them as the point's facing direction and compare that to the
      // light direction to get a brightness value for this point.
      const shade = Math.max(x * lightX + y * lightY + z * lightZ, 0.15);
      colors.push(baseColor[0] * shade, baseColor[1] * shade, baseColor[2] * shade);
    }
  }

  // #1: connects each point to its neighbors (one step over, one row down)
  // to build the triangles that make up the ball's surface.
  for (let i = 0; i < vSteps; i++) {
    for (let j = 0; j < uSteps; j++) {
      const k1 = (i * (uSteps + 1)) + j;
      const k2 = k1 + uSteps + 1;
      indices.push(k1, k2, k1 + 1);
      indices.push(k2, k2 + 1, k1 + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    indices: new Uint16Array(indices)
  };
}

// #1: basketball is just this ball shape with the same radius on every axis.
const basketball = makeBall(0.6, 0.6, 0.6, 24, 16, [1.0, 0.45, 0.0]);

// #1: football is the same ball shape, just stretched longer along x.
const football = makeBall(0.9, 0.45, 0.45, 24, 16, [0.55, 0.27, 0.07]);
// #1: builds a box of one solid color (corners at -1 and 1 on every axis). each face gets
// its own four corners so each face can have its own brightness. the arm parts, floor
// and fingers are all this same box, stretched to the size they need
function makeBox(color) {
  const positions = [];
  const colors = [];
  const indices = [];

  const lightX = 0.4082, lightY = 0.4082, lightZ = 0.8165;

  // #1: for each face: which way it points (n) and two directions along it (u, v)
  const faces = [
    { n: [ 1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] },
    { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
    { n: [ 0, 1, 0], u: [0, 0, 1], v: [1, 0, 0] },
    { n: [ 0,-1, 0], u: [1, 0, 0], v: [0, 0, 1] },
    { n: [ 0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
    { n: [ 0, 0,-1], u: [0, 1, 0], v: [1, 0, 0] }
  ];

  faces.forEach((f, i) => {
    // #1: faces pointing toward the light are brighter, with a minimum so none go fully black
    const shade = 0.3 + 0.7 * Math.max(f.n[0] * lightX + f.n[1] * lightY + f.n[2] * lightZ, 0);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => {
      positions.push(
        f.n[0] + a * f.u[0] + b * f.v[0],
        f.n[1] + a * f.u[1] + b * f.v[1],
        f.n[2] + a * f.u[2] + b * f.v[2]);
      colors.push(color[0] * shade, color[1] * shade, color[2] * shade);
    });
    // #1: each face is two triangles made from its four corners
    const k = i * 4;
    indices.push(k, k + 1, k + 2, k, k + 2, k + 3);
  });

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    indices: new Uint16Array(indices)
  };
}
