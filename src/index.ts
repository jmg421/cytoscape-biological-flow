import impl from './layout.ts';

// registers the extension on a cytoscape lib ref
let register = function( cytoscape?: any ){
  if( !cytoscape ){ return; }

  cytoscape( 'layout', 'biological-flow', impl );
};

if( typeof window !== 'undefined' && typeof ( window as any ).cytoscape !== 'undefined' ){
  register( ( window as any ).cytoscape );
}

export default register;
