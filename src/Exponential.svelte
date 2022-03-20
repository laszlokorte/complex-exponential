<script>
  import { onMount, tick  } from "svelte";
  import createRegl from "regl";

  import makeDragControl from './camera'
  import {
    vectorMultiplyMatrix,
    matrixMultiplyMatrix,
    matrixInverse,
    deg2rad,
    makeMatrixPerspective,
    makeMatrixIdentity,
    makeMatrixScale,
    makeMatrixTranslate,
    makeMatrixRotateZ,
    makeMatrixRotateX,
    makeMatrixRotateY,
  } from './math.js'

  import {
    makeArrowShader,
    makePointShader,
    roundCapJoinGeometry,
    makeLineShader,
    makeColorGridShader,
    labelShader,
  } from './shaders.js'
 
  let className
  export {className as class};

  export let perspective = true;

  let gl;

  export let growth = 0
  export let freq = 0

  const sidelength = 1024
  let lineBuffer;
  let camera;

  $: {
    if(lineBuffer) {
      lineBuffer(Array(sidelength).fill(null).map((_,i) => [
        (i/sidelength-0.5)*10,
        Math.exp((i/sidelength-0.5)*growth) * 0.2 * Math.cos((i/sidelength-0.5)*freq*Math.PI*4),
        Math.exp((i/sidelength-0.5)*growth) * 0.2 * Math.sin((i/sidelength-0.5)*freq*Math.PI*4),
      ]));
    }
  }

  $: {
    if(camera) {
      camera.setPerspective(perspective)
    }
  }

  onMount(async () => {
    await tick()
    window.onerror = function(msg) {
      document.body.innerHTML = (msg)
    }


	  gl.width = gl.clientWidth * window.devicePixelRatio
  	gl.height = gl.clientHeight * window.devicePixelRatio
   
    const re = createRegl({
    	canvas: gl, 
      extensions: ["ANGLE_instanced_arrays"]
    })

    camera = makeDragControl(re, gl)
    const drawGauss = makeColorGridShader(re)
    const drawAxis = makeArrowShader(re)
    const drawPoints = makePointShader(re)
    const drawLine = makeLineShader(re)
    const drawLabel = labelShader(re)

    const modelMatrix = makeMatrixTranslate(-1,0,-1)
    const axisMatrix = makeMatrixTranslate(0,0,0)
    const edgeYMatrix = makeMatrixTranslate(-1.1,0,-1)
    const edgeXMatrix = makeMatrixTranslate(-1,0,-1.1)

    const axisBuffer = re.buffer([
      //x
      -0.5,0,0,
      1,0,0,

      //z
      0,0,-0.25,
      0,0,0.5,

      //y
      0,-0.25,0,
      0,0.5,0,

    ]);


    lineBuffer = re.buffer(Array(sidelength).fill(null).map((_,i) => [
      (i/sidelength-0.5)*10,
      Math.exp(-(i/sidelength-0.5)*growth) * 0.2 * Math.cos((i/sidelength-0.5)*freq*Math.PI*2),
      Math.exp(-(i/sidelength-0.5)*growth) * 0.2 * Math.sin((i/sidelength-0.5)*freq*Math.PI*2),
    ]));

    const labelBuffer = re.buffer([
      1,0,0,
      0,0,0.55,
      0,0.55,0,
    ])
    const glyphBuffer = re.buffer([
      1,1,
      1,0,
      0,0,
    ])

  	re.frame(({time}) => {

		  gl.width = gl.clientWidth * window.devicePixelRatio
	  	gl.height = gl.clientHeight * window.devicePixelRatio
  	  // clear contents of the drawing buffer
  	  re.clear({
  	    color: [0, 0, 0, 0],
  	    depth: 1
  	  })


  	  camera.setup(() => {
        drawAxis({
          points: axisBuffer,
          model: axisMatrix,
          color: [0,0,0, 1],
          width: 2 * window.devicePixelRatio,
          segments: 3,
          resolution: [gl.width,gl.height],
          depth: true,
        })

        drawLabel({
          points: labelBuffer,
          glyphs: glyphBuffer,
          offset: [0.5,0.5],
          model: axisMatrix,
          color: [0,0,0, 1],
          width: 30 * window.devicePixelRatio,
          resolution: [gl.width,gl.height],
          depth: false,
          segments: 3,
        })

        drawLine({
          points: lineBuffer,
          model: axisMatrix,
          color: [0.3,0.8,0.9, 1],
          width: 4 * window.devicePixelRatio,
          segments: sidelength-1,
          resolution: [gl.width,gl.height],
          depth: true,
        })
  	  })
  	})

    return () => re.destroy()
  });
</script>

<style>
	.hide {
		display: none;
	}
</style>

<canvas bind:this={gl} class="{className}"></canvas>
