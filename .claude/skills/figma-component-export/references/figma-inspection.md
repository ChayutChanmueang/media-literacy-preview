# Figma Inspection Reference

## Read-Only use_figma Pattern

Use this pattern after loading figma-use guidance when local raw values or design context are insufficient. Keep scripts read-only for export inspection.

```js
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
    isMask: 'isMask' in n ? n.isMask : null,
    fills: 'fills' in n && Array.isArray(n.fills) ? n.fills.map(paint) : undefined,
    strokes: 'strokes' in n && Array.isArray(n.strokes) ? n.strokes.map(paint) : undefined,
    strokeWeight: 'strokeWeight' in n ? n.strokeWeight : undefined,
    strokeAlign: 'strokeAlign' in n ? n.strokeAlign : undefined,
    strokeCap: 'strokeCap' in n ? n.strokeCap : undefined,
    strokeJoin: 'strokeJoin' in n ? n.strokeJoin : undefined,
    dashPattern: 'dashPattern' in n ? n.dashPattern : undefined,
    cornerRadius: 'cornerRadius' in n ? n.cornerRadius : undefined,
    topLeftRadius: 'topLeftRadius' in n ? n.topLeftRadius : undefined,
    topRightRadius: 'topRightRadius' in n ? n.topRightRadius : undefined,
    bottomRightRadius: 'bottomRightRadius' in n ? n.bottomRightRadius : undefined,
    bottomLeftRadius: 'bottomLeftRadius' in n ? n.bottomLeftRadius : undefined,
    effects: 'effects' in n && Array.isArray(n.effects) ? n.effects.map(effect) : undefined,
    characters: n.type === 'TEXT' ? n.characters : undefined,
    fontName: n.type === 'TEXT' ? n.fontName : undefined,
    fontSize: n.type === 'TEXT' ? n.fontSize : undefined,
    fontWeight: n.type === 'TEXT' ? n.fontWeight : undefined,
    lineHeight: n.type === 'TEXT' ? n.lineHeight : undefined,
    letterSpacing: n.type === 'TEXT' ? n.letterSpacing : undefined,
    textAlignHorizontal: n.type === 'TEXT' ? n.textAlignHorizontal : undefined,
    textAlignVertical: n.type === 'TEXT' ? n.textAlignVertical : undefined,
    textAutoResize: n.type === 'TEXT' ? n.textAutoResize : undefined,
    vectorPaths: 'vectorPaths' in n ? n.vectorPaths : undefined
  };
}

const descendants = 'findAll' in node ? node.findAll(() => true) : [];
return { component: info(node), descendants: descendants.map(info) };
```

## SVG Export Snippet

```js
const node = await figma.getNodeByIdAsync('NODE_ID');
if (!node) throw new Error('NODE_ID not found');
const bytes = await node.exportAsync({ format: 'SVG' });
let svg = '';
for (const b of bytes) svg += String.fromCharCode(b);
return { id: node.id, name: node.name, width: node.width, height: node.height, svg };
```

When Figma SVG export includes page background wrappers or unrelated ancestor shadows, strip only the unrelated wrapper after confirming the target group/filter remains intact. Document the correction.

## Metadata Search Snippet

```js
const rx = /(NameA|NameB|NameC)/i;
const results = [];
for (const page of figma.root.children) {
  await figma.setCurrentPageAsync(page);
  for (const n of page.findAll(n => rx.test(n.name))) {
    results.push({ page: page.name, id: n.id, name: n.name, type: n.type, width: n.width, height: n.height });
  }
}
return { count: results.length, results };
```
