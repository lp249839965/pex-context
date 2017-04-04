const checkProps = require('./check-props')
const assert = require('assert')
const flatten = require('ramda/src/flatten')

const allowedProps = [
  'target', 'data', 'usage'
]

function createBuffer (ctx, opts) {
  const gl = ctx.gl
  checkProps(allowedProps, opts)
  assert(opts.target === gl.ARRAY_BUFFER || opts.target === gl.ELEMENT_ARRAY_BUFFER, 'Invalid buffer target')

  let className = (opts.target === gl.ARRAY_BUFFER) ? 'vertexBuffer' : 'indexBuffer'

  const buffer = {
    class: className,
    handle: gl.createBuffer(),
    target: opts.target,
    usage: opts.usage || gl.STATIC_DRAW,
    _update: updateBuffer
  }

  updateBuffer(ctx, buffer, opts)

  return buffer
}

function updateBuffer (ctx, buffer, opts) {
  checkProps(allowedProps, opts)

  const gl = ctx.gl
  let data = opts.data
  let type = opts.type || buffer.type

  if (Array.isArray(opts.data)) {
    data = flatten(data)
    if (!type) {
      if (opts.target === gl.ARRAY_BUFFER) type = ctx.DataType.Float32
      else if (opts.target === gl.ELEMENT_ARRAY_BUFFER) type = ctx.DataType.Uint16
      else throw new Error('Missing buffer type')
    }
    if (type === ctx.DataType.Float32) data = new Float32Array(data)
    else if (type === ctx.DataType.Uint16) data = new Uint16Array(data)
    else throw new Error(`Unknown buffer type: ${type}`)
  } else {
    if (data instanceof Float32Array) type = ctx.DataType.Float32
    else if (data instanceof Uint16Array) type = ctx.DataType.Uint16
    else throw new Error(`Unknown buffer data type: ${data.constructor}`)
  }

  buffer.type = type
  buffer.data = data
  buffer.length = data.length

  // TODO: push state, and pop as this can modify existing VBO?
  gl.bindBuffer(buffer.target, buffer.handle)
  gl.bufferData(buffer.target, data, buffer.usage)
}

module.exports = createBuffer