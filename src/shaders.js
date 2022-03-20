export function makeArrowShader(regl) {
  const roundCapJoin = {
    buffer: regl.buffer([
      [0, -0.5, 0],
      [0, -0.5, 1],
      [0, 0.5, 1],
      [0, -0.5, 0],
      [0, 0.5, 1],
      [0, 0.5, 0],

      [8,0,1],
      [0.5,3,1],
      [2,0,1],

      [8,0,1],
      [2,0,1],
      [0.5,-3,1],
    ]),
    count: 12
  }

  return regl({
    vert: `
      precision highp float;
      attribute vec3 position;
      attribute vec3 pointA, pointB;
      uniform float width;
      uniform vec2 resolution;
      uniform mat4 model, view, projection;

      void main() {
        vec4 clip0 = projection * view * model * vec4(pointA, 1.0);
        vec4 clip1 = projection * view * model * vec4(pointB, 1.0);
        vec2 screen0 = resolution * (0.5 * clip0.xy/clip0.w + 0.5);
        vec2 screen1 = resolution * (0.5 * clip1.xy/clip1.w + 0.5);
        vec2 xBasis = normalize(screen1 - screen0);
        vec2 yBasis = vec2(-xBasis.y, xBasis.x);
        vec2 pt0 = screen0 + width * (position.x * xBasis + position.y * yBasis);
        vec2 pt1 = screen1 + width * (position.x * xBasis + position.y * yBasis);
        vec2 pt = mix(pt0, pt1, position.z);
        vec4 clip = mix(clip0, clip1, position.z);
        gl_Position = vec4(clip.w * (2.0 * pt/resolution - 1.0), clip.z, clip.w);
      }`,

    frag: `
      precision highp float;
      uniform vec4 color;
      void main() {
        gl_FragColor = color;
      }`,

    attributes: {
      position: {
        buffer: roundCapJoin.buffer,
        divisor: 0
      },
      pointA: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0,
        stride: Float32Array.BYTES_PER_ELEMENT * 6
      },
      pointB: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 3,
        stride: Float32Array.BYTES_PER_ELEMENT * 6
      }
    },

    uniforms: {
      width: regl.prop("width"),
      color: regl.prop("color"),
      model: regl.prop("model"),
      resolution: regl.prop("resolution")
    },

    depth: {
      enable: regl.prop("depth")
    },

    cull: {
      enable: true,
      face: "back"
    },

    blend: {
      enable: true,
      func: {
        srcRGB: 'src alpha',
        srcAlpha: 1,
        dstRGB: 'one minus src alpha',
        dstAlpha: 1
      },
      equation: {
        rgb: 'add',
        alpha: 'add'
      },
      color: [0, 0, 0, 0]
    },

    polygonOffset: {
      enable: true,
      offset: {
        factor: 0,
        units: 32
      }
    },


    count: roundCapJoin.count,
    instances: regl.prop("segments")
  });
}

export function makePointShader(regl) {
  const roundCapJoin = {
    buffer: regl.buffer([
      [-1,-1],
      [-1,1],
      [1,1],
      [-1,-1],
      [1,1],
      [1,-1],
    ]),
    count: 6
  }

  return regl({
    vert: `
      precision highp float;
      attribute vec2 position;
      attribute vec2 point;
      uniform float width;
      uniform vec2 resolution;
      uniform mat4 model, view, projection;

      void main() {
        vec4 clip = projection * view * model * vec4(point.x, 0.0, point.y, 1.0);
        gl_Position = vec4(clip.x + width*clip.w*position.x/resolution.x, clip.y + width*clip.w*position.y/resolution.y, clip.z, clip.w);
      }`,

    frag: `
      precision highp float;
      uniform vec4 color;
      void main() {
        gl_FragColor = color;
      }`,

    attributes: {
      position: {
        buffer: roundCapJoin.buffer,
        divisor: 0
      },
      point: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0,
        stride: Float32Array.BYTES_PER_ELEMENT * 2
      },
    },

    uniforms: {
      width: regl.prop("width"),
      color: regl.prop("color"),
      model: regl.prop("model"),
      resolution: regl.prop("resolution")
    },

    depth: {
      enable: regl.prop("depth")
    },

    cull: {
      enable: false,
      face: "back"
    },

    blend: {
      enable: true,
      func: {
        srcRGB: 'src alpha',
        srcAlpha: 1,
        dstRGB: 'one minus src alpha',
        dstAlpha: 1
      },
      equation: {
        rgb: 'add',
        alpha: 'add'
      },
      color: [0, 0, 0, 0]
    },

  

    polygonOffset: {
      enable: true,
      offset: {
        factor: 0,
        units: 32
      }
    },


    count: roundCapJoin.count,
    instances: regl.prop("segments")
  });
}

export function roundCapJoinGeometry(regl, resolution) {
  const instanceRoundRound = [
    [0, -0.5, 0],
    [0, -0.5, 1],
    [0, 0.5, 1],
    [0, -0.5, 0],
    [0, 0.5, 1],
    [0, 0.5, 0]
  ];
  // Add the left cap.
  for (let step = 0; step < resolution; step++) {
    const theta0 = Math.PI / 2 + ((step + 0) * Math.PI) / resolution;
    const theta1 = Math.PI / 2 + ((step + 1) * Math.PI) / resolution;
    instanceRoundRound.push([0, 0, 0]);
    instanceRoundRound.push([
      0.5 * Math.cos(theta0),
      0.5 * Math.sin(theta0),
      0
    ]);
    instanceRoundRound.push([
      0.5 * Math.cos(theta1),
      0.5 * Math.sin(theta1),
      0
    ]);
  }
  // Add the right cap.
  for (let step = 0; step < resolution; step++) {
    const theta0 = (3 * Math.PI) / 2 + ((step + 0) * Math.PI) / resolution;
    const theta1 = (3 * Math.PI) / 2 + ((step + 1) * Math.PI) / resolution;
    instanceRoundRound.push([0, 0, 1]);
    instanceRoundRound.push([
      0.5 * Math.cos(theta0),
      0.5 * Math.sin(theta0),
      1
    ]);
    instanceRoundRound.push([
      0.5 * Math.cos(theta1),
      0.5 * Math.sin(theta1),
      1
    ]);
  }
  return {
    buffer: regl.buffer(instanceRoundRound),
    count: instanceRoundRound.length
  };
}

export function makeLineShader(regl, resolution) {
  const roundCapJoin = roundCapJoinGeometry(regl, resolution);
  return regl({
    vert: `
      precision highp float;
      attribute vec3 position;
      attribute vec3 pointA, pointB;
      uniform float width;
      uniform vec2 resolution;
      uniform vec3 axisFilter;
      uniform vec3 axisShift;
      uniform mat4 model, view, projection;

      varying float d;

      void main() {
        vec4 clip0 = projection * view * model * vec4(pointA, 1.0);
        vec4 clip1 = projection * view * model * vec4(pointB, 1.0);
        vec2 screen0 = resolution * (0.5 * clip0.xy/clip0.w + 0.5);
        vec2 screen1 = resolution * (0.5 * clip1.xy/clip1.w + 0.5);
        vec2 xBasis = normalize(screen1 - screen0);
        if(pointA==pointB) {
          xBasis = vec2(1.0,0.0);
        }
        vec2 yBasis = vec2(-xBasis.y, xBasis.x);
        vec2 pt0 = screen0 + width * (position.x * xBasis + position.y * yBasis);
        vec2 pt1 = screen1 + width * (position.x * xBasis + position.y * yBasis);
        vec2 pt = mix(pt0, pt1, position.z);
        vec4 clip = mix(clip0, clip1, position.z);
        gl_Position = vec4(clip.w * (2.0 * pt/resolution - 1.0), clip.z, clip.w);
      }`,

    frag: `
      precision highp float;
      uniform vec4 color;
      void main() {
        gl_FragColor = color;
      }`,

    attributes: {
      position: {
        buffer: roundCapJoin.buffer,
        divisor: 0
      },
      pointA: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: (_, props) => ((props.segmentOffset??0) * 3 * Float32Array.BYTES_PER_ELEMENT) + Float32Array.BYTES_PER_ELEMENT * 0,
        stride: Float32Array.BYTES_PER_ELEMENT * 3
      },
      pointB: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: (_, props) => ((props.segmentOffset??0) * 3 * Float32Array.BYTES_PER_ELEMENT) + Float32Array.BYTES_PER_ELEMENT * 3 * (props.segmentLength??1),
        stride: Float32Array.BYTES_PER_ELEMENT * 3
      }
    },

    uniforms: {
      width: regl.prop("width"),
      color: regl.prop("color"),
      model: regl.prop("model"),
      resolution: regl.prop("resolution")
    },

    depth: {
      enable: regl.prop("depth")
    },

    cull: {
      enable: true,
      face: "back"
    },

    blend: {
      enable: true,
      func: {
        srcRGB: 'src alpha',
        srcAlpha: 1,
        dstRGB: 'one minus src alpha',
        dstAlpha: 1
      },
      equation: {
        rgb: 'add',
        alpha: 'add'
      },
      color: [0, 0, 0, 0]
    },

    count: roundCapJoin.count,
    instances: regl.prop("segments")
  });
}

export function makeColorGridShader(regl) {
	const planeBuffer = regl.buffer([
    -1,0,-1,
    -1,0,+1,
    +1,0,+1,
    -1,0,-1,
    +1,0,+1,
    +1,0,-1,
  ])

  const weightBuffer = regl.buffer([
     1,0,0,0,//
     0,1,0,0,//
     0,0,0,1,
     1,0,0,0,//
     0,0,0,1,
     0,0,1,0,
  ])

  return regl({
    frag: `
    precision highp float;
    varying vec3 vColor;
    void main () {
      gl_FragColor = vec4(vColor,1);
    }`,
    vert: `
    attribute float pointA, pointB, pointC, pointD;
    attribute float instanceId;
    attribute vec3 position;
    attribute vec4 weight;
    uniform mat4 projection, view, model;
    uniform float sidelength;
    uniform float maxheight;
    varying vec3 vColor;
    void main() {
      float row = ceil(instanceId/sidelength);
      float col = ceil(mod(instanceId, sidelength));
      float noedge = float(col < (sidelength - 1.0));
      float height = noedge * dot(vec4(pointA,pointB, pointC, pointD), weight) + (1.0 - noedge) * (pointA * (weight.x+weight.y) + pointC * (weight.w+weight.z));

      vColor = vec3(0.5*sqrt(height),(height/maxheight),0.3+0.5*height*height/maxheight/maxheight);
      gl_Position = float(col > 1.0 && row > 1.0) * projection * view * model * vec4(
      position/sidelength + 
      vec3(2.0*row/sidelength,
      20.0 * height / sidelength,
      2.0*col/sidelength), 1);
    }`,
    attributes: {
      position: planeBuffer,
      weight: weightBuffer,
      pointA: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0,
        stride: Float32Array.BYTES_PER_ELEMENT * 1
      },
      pointB: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 1,
        stride: Float32Array.BYTES_PER_ELEMENT * 1
      },
      pointC: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * (0 + 256),
        stride: Float32Array.BYTES_PER_ELEMENT * 1
      },
      pointD: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * (1 + 256),
        stride: Float32Array.BYTES_PER_ELEMENT * 1
      },
      instanceId: {
        buffer: regl.prop("instanceIds"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0,
        stride: Float32Array.BYTES_PER_ELEMENT * 1
      },
    },
    uniforms: {
    	sidelength: regl.prop("sidelength"),
      model: regl.prop("model"),
      maxheight: regl.prop("maxheight"),
    },
    cull: {
      enable: false,
      face: 'back'
    },
    depth: {
      enable: true,
    },
    instances: regl.prop("instances"),
    count: 6,
  })
}


export function labelShader(regl) {
  const textureCanvas = document.createElement('canvas')
  textureCanvas.width = 256
  textureCanvas.height = 256
  const context2D = textureCanvas.getContext('2d')
  context2D.fillStyle = 'red'
  context2D.font = "100px sans-serif";
  context2D.fontWeight = "bold";
  context2D.fillStyle = 'white';
  context2D.textAlign = "center";
  context2D.textBaseline = "middle";
  context2D.fillText("Re", 64,64)
  context2D.fillText("Im", 192,64)
  context2D.fillText("t", 64,192)
  context2D.fillText("n", 192,192)
  const glypthTexture = regl.texture(textureCanvas)
  
  var quad = regl.buffer([
    [-0.5, -0.5],
    [0.5, -0.5],
    [0.5, 0.5],

    [0.5, 0.5],
    [-0.5, -0.5],
    [-0.5, 0.5],
  ])

  return regl({
    vert: `
      precision highp float;
      attribute vec2 position;
      attribute vec3 point;
      attribute vec2 glyphCoord;
      uniform float width;
      uniform vec2 resolution;
      uniform vec2 offset;
      uniform mat4 model, view, projection;
      uniform sampler2D  atlas;

      varying vec2 vGlyph;
      varying vec2 vPos;

      void main() {
        vec4 center = projection * view * model * vec4(point, 1.0);
        vec2 screen = resolution * (0.5 * center.xy/center.w + 0.5);
        vec2 pt = screen + width * (position + offset);

        vGlyph = 0.5*glyphCoord + 0.5*(position * vec2(1.0,-1.0) + 0.5);
        gl_Position = vec4(center.w * (2.0 * pt/resolution - 1.0), center.z, center.w);
      }`,

    frag: `
      precision highp float;
      uniform vec4 color;
      varying vec2 vGlyph;
      uniform sampler2D atlas;

      void main() {
        gl_FragColor = color * texture2D(atlas, vGlyph);
      }`,

    attributes: {
      position: {
        buffer: quad,
        divisor: 0
      },
      point: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0,
        stride: Float32Array.BYTES_PER_ELEMENT * 3
      },
      glyphCoord: {
        buffer: regl.prop("glyphs"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0,
        stride: Float32Array.BYTES_PER_ELEMENT * 2
      },
    },

    uniforms: {
      width: regl.prop("width"),
      color: regl.prop("color"),
      model: regl.prop("model"),
      point: regl.prop("point"),
      resolution: regl.prop("resolution"),
      atlas: glypthTexture,
      offset: regl.prop("offset"),
    },

    depth: {
      enable: false
    },

    cull: {
      enable: false,
      face: "back"
    },

    blend: {
      enable: true,
      func: {
        srcRGB: 'src alpha',
        srcAlpha: 1,
        dstRGB: 'one minus src alpha',
        dstAlpha: 1
      },
      equation: {
        rgb: 'add',
        alpha: 'add'
      },
      color: [0, 0, 0, 0]
    },

    stencil: {
      enable: (_, props) => props.stencilId >= 0,
      func: {
        cmp: 'equal',
        ref: 0xff,
        mask: (_, props) => 1 << props.stencilId,
      },
      op: {
        fail: 'keep',
        zfail: 'keep',
        zpass: 'keep'
      },
    },

    polygonOffset: {
      enable: true,
      offset: {
        factor: 0,
        units: 60
      }
    },

    count: 6,
    instances: regl.prop("segments"),
  });
}