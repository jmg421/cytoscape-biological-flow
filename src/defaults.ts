/**
 * Biological Flow Layout defaults
 *
 * A hierarchical layout for biological pathway visualization:
 * left-to-right signal flow with crossing minimization.
 *
 * Contributed by Nodes Bio (https://nodes.bio)
 */
const defaults = {
  // Margin from the left edge before the first layer
  xMargin: 150,
  // Margin from the top edge
  yMargin: 200,
  // Horizontal spacing between layers (columns)
  xSpacing: 300,
  // Vertical spacing between nodes within a layer
  ySpacing: 250,

  /* general layout options */
  // Whether to fit to viewport
  fit: true,
  // Fit padding
  padding: 80,
  // Whether to transition the node positions
  animate: false,
  // Duration of animation in ms if enabled
  animationDuration: 500,
  // Easing of animation if enabled
  animationEasing: undefined as string | undefined,
  // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  boundingBox: undefined as any,
  // A function that applies a transform to the final node position
  transform: function( _node: any, pos: any ){ return pos; },
  // On layoutready
  ready: function(){},
  // On layoutstop
  stop: function(){},
};

export default defaults;
