import {
  vectorMultiplyMatrix,
  matrixMultiplyMatrix,
  matrixInverse,
  deg2rad,
  makeMatrixPerspective,
  makeMatrixOrtho,
  makeMatrixIdentity,
  makeMatrixScale,
  makeMatrixTranslate,
  makeMatrixRotateZ,
  makeMatrixRotateX,
  makeMatrixRotateY,
  makeMatrixOrthoPerspective,
} from './math.js'

export default function makeDragControl(regl, el) {
  const clickDelay = 1;
  const state = {
    isDragging: false,
    zoom: 1,
    rotationX: 0,
    rotationY: 0,
    isTouching: false,
    touchX: 0,
    touchY: 0,
    perspective: true,
    setPerspective: (p) => { state.perspective = p },
    setup: regl({
      context: {
        view: ({tick}) => {
          const w = el.width/2
          const h = el.height/2
          const t = 0.01 * tick
          return [
            makeMatrixTranslate(0,0,-10),
            makeMatrixRotateX(-state.rotationX),
            makeMatrixRotateY(-state.rotationY),
          ].reduce(matrixMultiplyMatrix)
        },
        projection: ({viewportWidth, viewportHeight, perspective}) =>
          makeMatrixOrthoPerspective(state.perspective, viewportHeight, 45/state.zoom, viewportWidth/viewportHeight, 0.01, 128),

        viewport: () => ({ x: 0, y: 0, width: el.width, height: el.height }),
      },

      uniforms: {
        view: regl.context('view'),
        projection: regl.context('projection'),
        viewport: regl.context('viewport'),
      }
    }),
  }

  function screenToFloor(x,y) {
    const projectionMatrix = makeMatrixPerspective(55, el.width/el.height, 0.01, 128);

    const viewMatrix = [
      makeMatrixTranslate(0,0,-10),
      makeMatrixRotateX(-state.rotationX),
      makeMatrixRotateY(-state.rotationY),
    ].reduce(matrixMultiplyMatrix)

    const invProj = matrixInverse(projectionMatrix)
    const invView = matrixInverse(viewMatrix)

    const deviceX = ((x - el.offsetTop) / el.offsetWidth) * 2 - 1;
    const deviceY = -(((y - el.offsetLeft) / el.offsetHeight) * 2 - 1);

    const clip = [deviceX, deviceY, -1,1]

    const [eyeX, eyeY, eyeZ, eyeW] = vectorMultiplyMatrix(clip, invProj);
    const [worldX, worldY, worldZ] = vectorMultiplyMatrix([eyeX, eyeY, -1, 0], invView);
    
    const wLength = Math.sqrt(worldX*worldX + worldY*worldY + worldZ*worldZ)

    const ray = [worldX/wLength,worldY/wLength,worldZ/wLength]

    const cam = vectorMultiplyMatrix([0,0,0,1], invView)

    if(ray[1] < 0) {      
      const t = cam[1]/ray[1];
      const x = 0.5+0.5*(cam[0] - t*ray[0])
      const y = 0.5+0.5*(cam[2] - t*ray[2])
      
      return [x,y]
    }

    return null
  }

  function pan(dx, dy) {
    state.rotationX += 0.01 * dy * window.devicePixelRatio
    state.rotationY += 0.01 * dx * window.devicePixelRatio

    state.rotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, state.rotationX))
  }

  function zoom(z) {
    if(!z) return; 

    state.zoom *= Math.exp(z)
    state.zoom = Math.max(1, Math.min(10, state.zoom))
  }

  el.addEventListener('mousedown', function(evt) {
    evt.preventDefault()
    

    state.isDragging = true
    noclick = false
  })

  let noclick = 0
  el.addEventListener('click', function(evt) {
    if(evt.altKey) {
      state.perspective ^= true;
    }
    if(noclick <= clickDelay) {
      evt.preventDefault()
      evt.stopPropagation()
      const s = screenToFloor(evt.pageX, evt.pageY)
    }
  }, true)

  el.addEventListener('dblclick', function(evt) {
      
      evt.preventDefault()
      evt.stopPropagation()
      if(evt.altKey) {
        return
      }
      state.zoom = 1
      state.rotationX = evt.shiftKey ? -Math.PI/2 : 0
      state.rotationY = 0
  }, true)


  el.ownerDocument.addEventListener('mousemove', function(evt) {
    if(state.isDragging) {
      noclick++
      if(noclick > clickDelay) {
        pan(evt.movementX, evt.movementY)
      }
    }
  })

  el.ownerDocument.addEventListener('mouseup', function() {
    state.isDragging = false
  })

  el.addEventListener('wheel', function(evt) {
    if(evt.shiftKey || evt.altKey) {
      return
    }
    evt.preventDefault()
    zoom(evt.wheelDelta/400 || evt.deltaY/100)
  })

  var touchState = {
    touchIds: [],
    prevDistance: null,
    prevRotation: null,
  }

  el.addEventListener('touchstart', function touchStart(evt) {
    var newIds = Array.prototype.map.call(evt.changedTouches, function(t) {
      return t.identifier;
    })

    touchState.touchIds = touchState.touchIds.concat(newIds).filter(onlyUnique)

    var touches = filterTouches(touchState.touchIds, evt.touches)

    if(touchState.touchIds.length >= 1) {
      touchState.panBase = touchCenter(touches)
    } else {
      touchState.panBase = null
    }

    if (touchState.touchIds.length >= 1) {
      touchState.prevDistance = touchRadius(touches);
      touchState.prevRotation = touchRotation(touches);
      touchState.pinchPivot = touchCenter(touches)
    } else {
      touchState.prevDistance = null;
      touchState.prevRotation = null;
    }

    if(evt.touches.length >= 1) {
      event.preventDefault()
    }
    if(evt.touches.length < 2) {
      noclick = 0
    }
  });

  el.ownerDocument.addEventListener('touchmove', function touchMove(evt) {
    if(touchState.touchIds.length === 0) {
      return;
    }

    var touches = filterTouches(touchState.touchIds, evt.touches)
    var preventDefault = false;

    if(touchState.panBase) {
      noclick++
      if(noclick > clickDelay) {
        var pos = touchCenter(touches)
        pan((pos.x - touchState.panBase.x)/3, (pos.y - touchState.panBase.y)/3)

        touchState.panBase.x = pos.x
        touchState.panBase.y = pos.y
        preventDefault = true;
      }
    }

    if(touchState.prevDistance) {
      noclick++
      if(noclick > clickDelay) {
        var touches = filterTouches(touchState.touchIds, evt.touches)
        var distance = touchRadius(touches);

        zoom((distance - touchState.prevDistance) / 100, touchState.pinchPivot);
        touchState.prevDistance = distance;
        preventDefault = true;
      }
    }

    if(touches.length >= 2) {
      var rotation = touchRotation(touches)
      if(rotation && touchState.prevRotation !== null) {
        touchState.prevRotation = rotation;
      } else if(rotation) {
        touchState.prevRotation = rotation;
      }
      preventDefault = true;
    }

    if(false && preventDefault) {
      evt.preventDefault()
    }
  });

  el.ownerDocument.addEventListener('touchend', function touchEnd(evt) {
    if(touchState.touchIds.length === 0) {
      return
    }

    if(noclick <= clickDelay) {
      const s = screenToFloor(touchState.panBase.x, touchState.panBase.y)
    }

    var oldIds = Array.prototype.map.call(evt.changedTouches, function(t) {
      return t.identifier;
    })

    touchState.touchIds = touchState.touchIds.filter(function diffId(id) {
      return oldIds.indexOf(id) < 0;
    })

    var touches = filterTouches(touchState.touchIds, evt.touches)

    if(touchState.touchIds.length >= 2) {
      touchState.panBase = touchCenter(touches)
    } else {
      touchState.panBase = null
    }

    if(touchState.touchIds.length >= 2) {
      touchState.prevDistance = touchRadius(touches);
      touchState.prevRotation = null;
      touchState.pinchPivot = touchCenter(touches)
    } else {
      touchState.prevDistance = null;
      touchState.prevRotation = null;
    }
  });

  function touchCenter(touches) {
    var length = touches.length
    return Array.prototype.reduce.call(touches, function(sum, touch) {
      return {
        x: sum.x + touch.clientX / length,
        y: sum.y + touch.clientY / length,
      };
    }, {x: 0, y: 0});
  }

  function touchRadius (touches) {
    var length = touches.length
    var center = touchCenter(touches)

    return Array.prototype.reduce.call(touches, function(sum, touch) {
        return sum +
        Math.sqrt(
          Math.pow(touch.clientX - center.x, 2) +
          Math.pow(touch.clientY - center.y, 2)
        );
    }, 0) / length
  }

  function touchRotation(touches) {
    var center = touchCenter(touches)

    var angles = Array.prototype.map.call(touches, function(touch) {
      return Math.atan2(touch.clientY - center.y, touch.clientX - center.x) + Math.PI;
    }, 0);

    var sum = (Array.prototype.reduce.call(angles, function(a,b){
      return a + b;
    }) * 180 / Math.PI);

    return (sum + 360 % 360);
  }


  function filterTouches (ids, touches) {
    return Array.prototype.filter.call(touches, function(t) {
      return ids.indexOf(t.identifier) > -1;
    })
  }

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  return state
}