/**
 * Biological Flow Layout — contributed by Nodes Bio
 *
 * Pure TypeScript implementation of a layered graph layout algorithm
 * optimized for biological pathway visualization.
 *
 * Algorithm:
 * 1. Break cycles via DFS back-edge removal
 * 2. Assign layers via longest-path (topological order)
 * 3. Barycenter heuristic for crossing reduction (forward + backward pass)
 * 4. Assign x/y positions: layer → column (L→R), row within layer (vertical spread)
 */
import defaults from './defaults.ts';
import assign from './assign.ts';

type LayoutOptions = typeof defaults;
type RunOptions = LayoutOptions & { cy?: any; eles?: any; name?: string; [key: string]: any };

// NB: must stay a function constructor; cytoscape invokes layouts without `new`.
function BiologicalFlowLayout( this: any, options: Partial<RunOptions> ) {
  this.options = assign( {}, defaults, options ) as RunOptions;
}

BiologicalFlowLayout.prototype.run = function( this: any ) {
  const options = this.options as RunOptions;
  const layout = this;
  const cy = options.cy;
  const eles = options.eles;

  const nodes = eles.nodes();
  const edges = eles.edges().stdFilter(function( edge: any ) {
    return !edge.source().isParent() && !edge.target().isParent();
  });

  const X_MARGIN = options.xMargin;
  const Y_MARGIN = options.yMargin;
  const X_SPACING = options.xSpacing;
  const Y_SPACING = options.ySpacing;

  // Build adjacency
  const nodeIds: string[] = [];
  for (let i = 0; i < nodes.length; i++) { nodeIds.push(nodes[i].id()); }

  const outEdges: Map<string, string[]> = new Map();
  const inEdges: Map<string, string[]> = new Map();

  for (let i = 0; i < edges.length; i++) {
    const src = edges[i].source().id();
    const tgt = edges[i].target().id();
    if (!outEdges.has(src)) outEdges.set(src, []);
    if (!inEdges.has(tgt)) inEdges.set(tgt, []);
    outEdges.get(src)!.push(tgt);
    inEdges.get(tgt)!.push(src);
  }

  // 1. Break cycles (DFS)
  const dagOut: Map<string, string[]> = new Map();
  const dagIn: Map<string, string[]> = new Map();
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color: Map<string, number> = new Map();
  nodeIds.forEach((id) => color.set(id, WHITE));

  const dfs = (u: string): void => {
    color.set(u, GRAY);
    for (const v of outEdges.get(u) ?? []) {
      if (color.get(v) === WHITE) {
        if (!dagOut.has(u)) dagOut.set(u, []);
        if (!dagIn.has(v)) dagIn.set(v, []);
        dagOut.get(u)!.push(v);
        dagIn.get(v)!.push(u);
        dfs(v);
      } else if (color.get(v) === BLACK) {
        if (!dagOut.has(u)) dagOut.set(u, []);
        if (!dagIn.has(v)) dagIn.set(v, []);
        dagOut.get(u)!.push(v);
        dagIn.get(v)!.push(u);
      }
      // GRAY = back edge (cycle) → skip
    }
    color.set(u, BLACK);
  };
  nodeIds.forEach((id) => { if (color.get(id) === WHITE) dfs(id); });

  // 2. Assign layers via longest-path
  const layer: Map<string, number> = new Map();
  const inDegree: Map<string, number> = new Map();
  nodeIds.forEach((id) => {
    layer.set(id, 0);
    inDegree.set(id, (dagIn.get(id) ?? []).length);
  });

  const queue: string[] = nodeIds.filter((id) => inDegree.get(id) === 0);
  while (queue.length > 0) {
    const u = queue.shift()!;
    for (const v of dagOut.get(u) ?? []) {
      layer.set(v, Math.max(layer.get(v)!, layer.get(u)! + 1));
      inDegree.set(v, inDegree.get(v)! - 1);
      if (inDegree.get(v) === 0) queue.push(v);
    }
  }

  // 3. Group by layer
  const layerGroups: Map<number, string[]> = new Map();
  for (const [id, l] of layer) {
    if (!layerGroups.has(l)) layerGroups.set(l, []);
    layerGroups.get(l)!.push(id);
  }
  const sortedLayers = [...layerGroups.keys()].sort((a, b) => a - b);

  // 4. Barycenter crossing reduction (forward + backward)
  const barycenter = (neighbors: string[], pos: Map<string, number>): number => {
    const relevant = neighbors.filter((nb) => pos.has(nb)).map((nb) => pos.get(nb)!);
    return relevant.length > 0 ? relevant.reduce((a, b) => a + b, 0) / relevant.length : Infinity;
  };

  // Forward pass
  for (let i = 1; i < sortedLayers.length; i++) {
    const l = sortedLayers[i];
    const prevL = sortedLayers[i - 1];
    const prevPos = new Map<string, number>();
    layerGroups.get(prevL)!.forEach((id, idx) => prevPos.set(id, idx));
    layerGroups.get(l)!.sort((a, b) =>
      barycenter(inEdges.get(a) ?? [], prevPos) - barycenter(inEdges.get(b) ?? [], prevPos)
    );
  }
  // Backward pass
  for (let i = sortedLayers.length - 2; i >= 0; i--) {
    const l = sortedLayers[i];
    const nextL = sortedLayers[i + 1];
    const nextPos = new Map<string, number>();
    layerGroups.get(nextL)!.forEach((id, idx) => nextPos.set(id, idx));
    layerGroups.get(l)!.sort((a, b) =>
      barycenter(outEdges.get(a) ?? [], nextPos) - barycenter(outEdges.get(b) ?? [], nextPos)
    );
  }

  // 5. Assign positions
  const maxLayerSize = Math.max(...sortedLayers.map((l) => layerGroups.get(l)!.length));

  nodes.layoutPositions(layout, options, function( this: any, ele: any ) {
    ele = typeof ele === 'object' ? ele : this;
    const id = ele.id();
    const col = layer.get(id)!;
    const nodesInLayer = layerGroups.get(sortedLayers[col !== undefined ? sortedLayers.indexOf(col) : 0])!;
    const row = nodesInLayer.indexOf(id);
    const n = nodesInLayer.length;
    const totalHeight = (n - 1) * Y_SPACING;
    const maxHeight = (maxLayerSize - 1) * Y_SPACING;
    const yOffset = Y_MARGIN + (maxHeight - totalHeight) / 2;

    return {
      x: X_MARGIN + sortedLayers.indexOf(col) * X_SPACING,
      y: yOffset + row * Y_SPACING
    };
  });

  return this;
};

export default BiologicalFlowLayout;
