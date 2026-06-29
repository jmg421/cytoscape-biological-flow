import cytoscape from 'cytoscape';
import chai from 'chai';
import register from '../dist/cytoscape-biological-flow.mjs';

const { expect } = chai;

register( cytoscape );

function createCy( elements ){
  return cytoscape({
    headless: true,
    elements
  });
}

function expectFinitePosition( node ){
  let position = node.position();

  expect( position.x ).to.be.a( 'number' );
  expect( position.y ).to.be.a( 'number' );
  expect( Number.isFinite( position.x ) ).to.equal( true );
  expect( Number.isFinite( position.y ) ).to.equal( true );
}

describe('biological-flow layout', function(){
  it('assigns left-to-right positions for a linear chain', function(){
    let cy = createCy([
      { data: { id: 'a' } },
      { data: { id: 'b' } },
      { data: { id: 'c' } },
      { data: { id: 'ab', source: 'a', target: 'b' } },
      { data: { id: 'bc', source: 'b', target: 'c' } }
    ]);

    cy.layout({ name: 'biological-flow' }).run();

    cy.nodes().forEach( expectFinitePosition );

    let ax = cy.getElementById('a').position().x;
    let bx = cy.getElementById('b').position().x;
    let cx = cy.getElementById('c').position().x;

    expect( ax ).to.be.below( bx );
    expect( bx ).to.be.below( cx );
  });

  it('handles cycles without crashing', function(){
    let cy = createCy([
      { data: { id: 'a' } },
      { data: { id: 'b' } },
      { data: { id: 'c' } },
      { data: { id: 'ab', source: 'a', target: 'b' } },
      { data: { id: 'bc', source: 'b', target: 'c' } },
      { data: { id: 'ca', source: 'c', target: 'a' } }
    ]);

    expect(function(){
      cy.layout({ name: 'biological-flow' }).run();
    }).to.not.throw();

    cy.nodes().forEach( expectFinitePosition );
  });

  it('assigns all nodes unique positions', function(){
    let cy = createCy([
      { data: { id: 'x' } },
      { data: { id: 'y' } },
      { data: { id: 'z' } },
      { data: { id: 'xy', source: 'x', target: 'y' } },
      { data: { id: 'xz', source: 'x', target: 'z' } }
    ]);

    cy.layout({ name: 'biological-flow' }).run();

    let positions = cy.nodes().map(n => `${n.position().x},${n.position().y}`);
    expect( new Set(positions).size ).to.equal( 3 );
  });

  it('handles disconnected components', function(){
    let cy = createCy([
      { data: { id: 'a' } },
      { data: { id: 'b' } },
      { data: { id: 'c' } },
      { data: { id: 'ab', source: 'a', target: 'b' } }
    ]);

    expect(function(){
      cy.layout({ name: 'biological-flow' }).run();
    }).to.not.throw();

    cy.nodes().forEach( expectFinitePosition );
  });

  it('respects custom spacing options', function(){
    let cy = createCy([
      { data: { id: 'a' } },
      { data: { id: 'b' } },
      { data: { id: 'ab', source: 'a', target: 'b' } }
    ]);

    cy.layout({ name: 'biological-flow', xSpacing: 500, fit: false }).run();

    let ax = cy.getElementById('a').position().x;
    let bx = cy.getElementById('b').position().x;

    // With xSpacing=500, difference should be ~500
    expect( bx - ax ).to.be.closeTo( 500, 1 );
  });

  it('runs on a branching pathway graph', function(){
    let cy = createCy([
      { data: { id: 'n0' } },
      { data: { id: 'n1' } },
      { data: { id: 'n2' } },
      { data: { id: 'n3' } },
      { data: { id: 'n4' } },
      { data: { id: 'e0', source: 'n0', target: 'n1' } },
      { data: { id: 'e1', source: 'n1', target: 'n2' } },
      { data: { id: 'e2', source: 'n1', target: 'n3' } },
      { data: { id: 'e3', source: 'n3', target: 'n4' } }
    ]);

    cy.layout({ name: 'biological-flow' }).run();

    cy.nodes().forEach( expectFinitePosition );

    // n0 should be leftmost, n1 next, then n2/n3 same layer, n4 rightmost
    let n0x = cy.getElementById('n0').position().x;
    let n1x = cy.getElementById('n1').position().x;
    let n4x = cy.getElementById('n4').position().x;

    expect( n0x ).to.be.below( n1x );
    expect( n1x ).to.be.below( n4x );
  });
});
