# cytoscape-biological-flow

A hierarchical layout extension for [Cytoscape.js](https://js.cytoscape.org) optimized for biological pathway visualization.

Produces left-to-right signal flow layouts with:
- DFS-based cycle breaking for feedback loops
- Longest-path layer assignment (topological order)
- Barycenter heuristic for edge crossing minimization
- Configurable spacing and margins

Zero external dependencies — pure TypeScript implementation.

Contributed by [Nodes Bio](https://nodes.bio).

## Install

```bash
npm install cytoscape-biological-flow
```

## Usage

```js
import cytoscape from 'cytoscape';
import biologicalFlow from 'cytoscape-biological-flow';

cytoscape.use( biologicalFlow );

let cy = cytoscape({
  container: document.getElementById('cy'),
  elements: [ /* ... */ ]
});

cy.layout({ name: 'biological-flow' }).run();
```

### Script tag (UMD)

```html
<script src="https://unpkg.com/cytoscape/dist/cytoscape.min.js"></script>
<script src="https://unpkg.com/cytoscape-biological-flow/dist/cytoscape-biological-flow.min.js"></script>
```

## Options

```js
cy.layout({
  name: 'biological-flow',

  // Layout spacing
  xMargin: 150,       // left margin before first layer
  yMargin: 200,       // top margin
  xSpacing: 300,      // horizontal distance between layers
  ySpacing: 250,      // vertical distance between nodes in a layer

  // Standard Cytoscape layout options
  fit: true,          // fit to viewport
  padding: 80,        // fit padding
  animate: false,
  animationDuration: 500,
  boundingBox: undefined,
  transform: (node, pos) => pos,
  ready: () => {},
  stop: () => {}
}).run();
```

## Algorithm

1. **Cycle breaking** — DFS traversal removes back edges to produce a DAG
2. **Layer assignment** — Longest-path algorithm assigns each node to a column (left → right)
3. **Crossing reduction** — Barycenter heuristic (forward + backward pass) reorders nodes within each layer
4. **Position assignment** — Nodes are placed on a grid with configurable spacing, vertically centered

## Build

```bash
npm run build    # rollup + type-check
npm test         # build + mocha
```

## License

MIT
