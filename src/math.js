export function vectorMultiplyMatrix([x,y,z,w], matrix) {
  return [
    // wir verstehen ein Element mit 12 Elementen als 3x4 Matrix
    // ein 3D Punkt/Vektor mal eine 3x4 Matrix ergibt wieder einen Punkt
    /*neues X:*/ x * matrix[0] + y * matrix[1] + z * matrix[2] + matrix[3] * w,
    /*neues Y:*/ x * matrix[4] + y * matrix[5] + z * matrix[6] + matrix[7] * w,
    /*neues Z:*/ x * matrix[8] + y * matrix[9] + z * matrix[10] + matrix[11] * w,
    /*neues Z:*/ x * matrix[12] + y * matrix[13] + z * matrix[14] + matrix[15] * w,
  ]
}

export function matrixMultiplyMatrix([
  _x1,  _x2,  _x3,  _x4,
  _y1,  _y2,  _y3,  _y4,
  _z1,  _z2,  _z3,  _z4,
  _w1,  _w2,  _w3,  _w4,
], [
  x1,  x2,  x3,  x4,
  y1,  y2,  y3,  y4,
  z1,  z2,  z3,  z4,
  w1,  w2,  w3,  w4,
]) {
  return [
    x1 * _x1 + x2 * _y1 + x3 * _z1 + x4 * _w1,
    x1 * _x2 + x2 * _y2 + x3 * _z2 + x4 * _w2,
    x1 * _x3 + x2 * _y3 + x3 * _z3 + x4 * _w3,
    x1 * _x4 + x2 * _y4 + x3 * _z4 + x4 * _w4,

    y1 * _x1 + y2 * _y1 + y3 * _z1 + y4 * _w1,
    y1 * _x2 + y2 * _y2 + y3 * _z2 + y4 * _w2,
    y1 * _x3 + y2 * _y3 + y3 * _z3 + y4 * _w3,
    y1 * _x4 + y2 * _y4 + y3 * _z4 + y4 * _w4,

    z1 * _x1 + z2 * _y1 + z3 * _z1 + z4 * _w1,
    z1 * _x2 + z2 * _y2 + z3 * _z2 + z4 * _w2,
    z1 * _x3 + z2 * _y3 + z3 * _z3 + z4 * _w3,
    z1 * _x4 + z2 * _y4 + z3 * _z4 + z4 * _w4,

    w1 * _x1 + w2 * _y1 + w3 * _z1 + w4 * _w1,
    w1 * _x2 + w2 * _y2 + w3 * _z2 + w4 * _w2,
    w1 * _x3 + w2 * _y3 + w3 * _z3 + w4 * _w3,
    w1 * _x4 + w2 * _y4 + w3 * _z4 + w4 * _w4,
  ]
}

export function matrixInverse([
  m00, m10, m20, m30,
  m01, m11, m21, m31,
  m02, m12, m22, m32,
  m03, m13, m23, m33,
]) {
  const A2323 = m22 * m33 - m23 * m32
  const A1323 = m21 * m33 - m23 * m31
  const A1223 = m21 * m32 - m22 * m31
  const A0323 = m20 * m33 - m23 * m30
  const A0223 = m20 * m32 - m22 * m30
  const A0123 = m20 * m31 - m21 * m30
  const A2313 = m12 * m33 - m13 * m32
  const A1313 = m11 * m33 - m13 * m31
  const A1213 = m11 * m32 - m12 * m31
  const A2312 = m12 * m23 - m13 * m22
  const A1312 = m11 * m23 - m13 * m21
  const A1212 = m11 * m22 - m12 * m21
  const A0313 = m10 * m33 - m13 * m30
  const A0213 = m10 * m32 - m12 * m30
  const A0312 = m10 * m23 - m13 * m20
  const A0212 = m10 * m22 - m12 * m20
  const A0113 = m10 * m31 - m11 * m30
  const A0112 = m10 * m21 - m11 * m20

  let det = m00 * ( m11 * A2323 - m12 * A1323 + m13 * A1223 ) 
      - m01 * ( m10 * A2323 - m12 * A0323 + m13 * A0223 ) 
      + m02 * ( m10 * A1323 - m11 * A0323 + m13 * A0123 ) 
      - m03 * ( m10 * A1223 - m11 * A0223 + m12 * A0123 )
  det = 1 / det;

  return [
     det *   ( m11 * A2323 - m12 * A1323 + m13 * A1223 ),
     det * - ( m01 * A2323 - m02 * A1323 + m03 * A1223 ),
     det *   ( m01 * A2313 - m02 * A1313 + m03 * A1213 ),
     det * - ( m01 * A2312 - m02 * A1312 + m03 * A1212 ),
     det * - ( m10 * A2323 - m12 * A0323 + m13 * A0223 ),
     det *   ( m00 * A2323 - m02 * A0323 + m03 * A0223 ),
     det * - ( m00 * A2313 - m02 * A0313 + m03 * A0213 ),
     det *   ( m00 * A2312 - m02 * A0312 + m03 * A0212 ),
     det *   ( m10 * A1323 - m11 * A0323 + m13 * A0123 ),
     det * - ( m00 * A1323 - m01 * A0323 + m03 * A0123 ),
     det *   ( m00 * A1313 - m01 * A0313 + m03 * A0113 ),
     det * - ( m00 * A1312 - m01 * A0312 + m03 * A0112 ),
     det * - ( m10 * A1223 - m11 * A0223 + m12 * A0123 ),
     det *   ( m00 * A1223 - m01 * A0223 + m02 * A0123 ),
     det * - ( m00 * A1213 - m01 * A0213 + m02 * A0113 ),
     det *   ( m00 * A1212 - m01 * A0212 + m02 * A0112 ),
  ]
}

export function deg2rad(deg) {
  return deg/180 * Math.PI
}

export function makeMatrixPerspective(fovDeg, aspect, near, far) {
  const f = 1.0 / Math.tan(deg2rad(fovDeg) / 2)
  const nf = 1 / (near - far)

  return [
    f / aspect, 0.0, 0.0, 0.0,
    0.0, f, 0.0, 0.0,
    0.0, 0.0, (far + near) * nf, -1.0,
    0.0, 0.0, (2 * far * near) * nf, 0.0
  ]
}

export function makeMatrixOrtho(vpHeight, fovDeg, aspect, near, far) {
  const f = Math.tan(deg2rad(fovDeg) / 2)
  const top = vpHeight * near * f
  const bottom = vpHeight * -near * f
  const left = aspect * bottom
  const right = aspect * top

  const lr = 1 / (left - right);
  const bt = 1 / (bottom - top);
  const nf = 1 / (near - far);
  
  return [-2 * lr,0,0,0,
   0,-2 * bt,0,0,
   0,0,nf,0,
   (left + right) * lr, (top + bottom) * bt, near * nf, 1];
}

export function makeMatrixOrthoPerspective(perspective, vpHeight, fovDeg, aspect, near, far) {
  if(perspective) {
    return makeMatrixPerspective(fovDeg, aspect, near, far)
  } else {
    return makeMatrixOrtho(vpHeight, fovDeg, aspect, near, far)
  }
}

export function makeMatrixIdentity() {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]
}

export function makeMatrixScale(x,y,z) {
  return [
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1,
  ]
}

export function makeMatrixTranslate(x,y,z) {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1,
  ]
}

export function makeMatrixRotateZ(angle) {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [
    c, -s, 0, 0,
    s,  c, 0, 0,
    0,  0, 1, 0,
    0,  0, 0, 1,
  ]
}

export function makeMatrixRotateX(angle) {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [
    1, 0,  0, 0,
    0, c, -s, 0,
    0, s,  c, 0,
    0, 0,  0, 1,
  ]
}

export function makeMatrixRotateY(angle) {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [
     c, 0, s,  0,
     0, 1, 0,  0,
    -s, 0, c,  0,
     0, 0, 0,  1,
  ]
}