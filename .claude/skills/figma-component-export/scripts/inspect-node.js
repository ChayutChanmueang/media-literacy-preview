// Paste into use_figma as read-only Plugin API code. Replace NODE_ID.
const node = await figma.getNodeByIdAsync('NODE_ID');
if (!node) throw new Error('NODE_ID not found');

function paint(p) {
  const out = { type: p.type, visible: p.visible, opacity: p.opacity, blendMode: p.blendMode };
  if ('color' in p && p.color) out.color = p.color;
  if ('gradientStops' in p) out.gradientStops = p.gradientStops;
  if ('gradientTransform' in p) out.gradientTransform = p.gradientTransform;
  if ('imageHash' in p) out.imageHash = p.imageHash;
  if ('scaleMode' in p) out.scaleMode = p.scaleMode;
  if ('imageTransform' in p) out.imageTransform = p.imageTransform;
  return out;
}
function effect(e) {
  const out = { type: e.type, visible: e.visible, radius: e.radius, spread: e.spread, blendMode: e.blendMode };
  if ('offset' in e) out.offset = e.offset;
  if ('color' in e) out.color = e.color;
  return out;
}
function info(n) {
  return {
    id: n.id,
    name: n.name,
    type: n.type,
    x: 'x' in n ? n.x : null,
    y: 'y' in n ? n.y : null,
    width: 'width' in n ? n.width : null,
    height: 'height' in n ? n.height : null,
    absoluteBoundingBox: 'absoluteBoundingBox' in n ? n.absoluteBoundingBox : null,
    absoluteRenderBounds: 'absoluteRenderBounds' in n ? n.absoluteRenderBounds : null,
    rotation: 'rotation' in n ? n.rotation : null,
    opacity: 'opacity' in n ? n.opacity : null,
    blendMode: 'blendMode' in n ? n.blendMode : null,
    visible: 'visible' in n ? n.visible : null,
    fills: 'fills' in n && Array.isArray(n.fills) ? n.fills.map(paint) : undefined,
    strokes: 'strokes' in n && Array.isArray(n.strokes) ? n.strokes.map(paint) : undefined,
    strokeWeight: 'strokeWeight' in n ? n.strokeWeight : undefined,
    strokeAlign: 'strokeAlign' in n ? n.strokeAlign : undefined,
    strokeCap: 'strokeCap' in n ? n.strokeCap : undefined,
    strokeJoin: 'strokeJoin' in n ? n.strokeJoin : undefined,
    cornerRadius: 'cornerRadius' in n ? n.cornerRadius : undefined,
    effects: 'effects' in n && Array.isArray(n.effects) ? n.effects.map(effect) : undefined,
    vectorPaths: 'vectorPaths' in n ? n.vectorPaths : undefined,
    characters: n.type === 'TEXT' ? n.characters : undefined,
    fontName: n.type === 'TEXT' ? n.fontName : undefined,
    fontSize: n.type === 'TEXT' ? n.fontSize : undefined,
    fontWeight: n.type === 'TEXT' ? n.fontWeight : undefined,
    lineHeight: n.type === 'TEXT' ? n.lineHeight : undefined,
    letterSpacing: n.type === 'TEXT' ? n.letterSpacing : undefined,
    textAlignHorizontal: n.type === 'TEXT' ? n.textAlignHorizontal : undefined,
    textAlignVertical: n.type === 'TEXT' ? n.textAlignVertical : undefined,
    textAutoResize: n.type === 'TEXT' ? n.textAutoResize : undefined
  };
}
const descendants = 'findAll' in node ? node.findAll(() => true) : [];
return { component: info(node), descendants: descendants.map(info) };
