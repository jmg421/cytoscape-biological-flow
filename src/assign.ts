// Simple Object.assign polyfill for options objects

const assign: (target: any, ...sources: any[]) => any = Object.assign != null ? Object.assign.bind( Object ) : function( tgt: any, ...srcs: any[] ){
  srcs.forEach( src => {
    Object.keys( src ).forEach( k => tgt[k] = src[k] );
  } );

  return tgt;
};

export default assign;
