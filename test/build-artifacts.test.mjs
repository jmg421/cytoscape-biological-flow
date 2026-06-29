import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import chai from 'chai';

const require = createRequire( import.meta.url );
const pkg = require('../package.json');
const { expect } = chai;

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const root = path.join( __dirname, '..' );
const dist = path.join( root, 'dist' );

function readDist( file ){
  return fs.readFileSync( path.join( dist, file ), 'utf8' );
}

describe('package metadata', function(){
  it('exposes CommonJS, ESM, TypeScript, and conditional export entrypoints', function(){
    expect( pkg.main ).to.equal( 'dist/cytoscape-biological-flow.js' );
    expect( pkg.module ).to.equal( 'dist/cytoscape-biological-flow.mjs' );
    expect( pkg.types ).to.equal( 'index.d.ts' );
    expect( pkg.exports['.'].types ).to.equal( './index.d.ts' );
    expect( pkg.exports['.'].import ).to.equal( './dist/cytoscape-biological-flow.mjs' );
    expect( pkg.exports['.'].require ).to.equal( './dist/cytoscape-biological-flow.js' );
  });

  it('has no external runtime dependencies', function(){
    expect( pkg.dependencies || {} ).to.deep.equal( {} );
    expect( pkg.peerDependencies ).to.have.property( 'cytoscape' );
  });
});

describe('built artifacts', function(){
  it('loads the UMD builds through CommonJS', function(){
    expect( require( '../dist/cytoscape-biological-flow.js' ) ).to.be.a( 'function' );
    expect( require( '../dist/cytoscape-biological-flow.min.js' ) ).to.be.a( 'function' );
  });

  it('loads the ESM builds through dynamic import', async function(){
    let esm = await import( pathToFileURL( path.join( dist, 'cytoscape-biological-flow.mjs' ) ).href );
    let min = await import( pathToFileURL( path.join( dist, 'cytoscape-biological-flow.min.mjs' ) ).href );

    expect( esm.default ).to.be.a( 'function' );
    expect( min.default ).to.be.a( 'function' );
  });

  it('has no external module imports in the bundle', function(){
    [
      'cytoscape-biological-flow.js',
      'cytoscape-biological-flow.mjs'
    ].forEach(function( file ){
      let source = readDist( file );
      // Should be self-contained — no require() or import from external packages
      expect( source ).to.not.match( /require\(['"](?!\.)/  );
    });
  });

  it('emits source maps for every build', function(){
    [
      'cytoscape-biological-flow.js.map',
      'cytoscape-biological-flow.min.js.map',
      'cytoscape-biological-flow.mjs.map',
      'cytoscape-biological-flow.min.mjs.map'
    ].forEach(function( file ){
      expect( fs.existsSync( path.join( dist, file ) ) ).to.equal( true );
    });
  });
});
