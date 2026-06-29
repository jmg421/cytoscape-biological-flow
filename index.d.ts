import cytoscape = require('cytoscape');

declare const cytoscapeBiologicalFlow: cytoscape.Ext;
export = cytoscapeBiologicalFlow;

declare namespace cytoscapeBiologicalFlow {
  interface BiologicalFlowLayoutOptions extends cytoscape.BaseLayoutOptions, cytoscape.AnimatedLayoutOptions {
    name: 'biological-flow';
    /** Margin from the left edge before the first layer (default: 150) */
    xMargin?: number;
    /** Margin from the top edge (default: 200) */
    yMargin?: number;
    /** Horizontal spacing between layers/columns (default: 300) */
    xSpacing?: number;
    /** Vertical spacing between nodes within a layer (default: 250) */
    ySpacing?: number;
    /** Whether to fit to viewport (default: true) */
    fit?: boolean;
    /** Fit padding (default: 80) */
    padding?: number;
    /** Constrain layout bounds */
    boundingBox?: cytoscape.BoundingBox12 | cytoscape.BoundingBoxWH;
    /** A function that applies a transform to the final node position */
    transform?: (node: cytoscape.NodeSingular, pos: cytoscape.Position) => cytoscape.Position;
  }
}
