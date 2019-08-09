import * as d3 from "d3";
import renderScaleBar from './scaleBar';

let setCenterNode;

function treeJSON(error, treeData) {
  const dictVoltageClass = {
    1150: 'rgba(205,138,255,1)',
    800: 'rgba(0,0,168,1)',
    750: 'rgba(0,0,168,1)',
    500: 'rgba(213,0,0,1)',
    400: 'rgba(255,100,30,1)',
    330: 'rgba(0,170,0,1)',
    220: 'rgba(181,181,0,1)',
    150: 'rgba(170,150,0,1)',
    110: 'rgba(0,153,255,1)',
    60: 'rgba(255,51,204,1)',
    35: 'rgba(102,51,0,1)',
    20: 'rgba(160,32,240,1)',
    15: 'rgba(160,32,240,1)',
    10: 'rgba(102,0,240,1)',
    6: 'rgba(0,102,0,1)',
    3: 'rgba(0,102,0,1)',
    0: 'rgba(127,127,127,1)'
  };
  const dictTypeLine = {
    'type1': 'rgba(128,128,128,1)',
    'type2': 'rgba(0,0,255,1)',
    'type3': 'rgba(255,165,0,1)',
    'type4': 'rgba(255,0,0,1)',
  };
  const dictRadius = {
    'substation': 0,
    'powerLine': 5,
    'pointsDelivery': 20,
  };
  const dictWidth = {
    'substation': 200,
    'powerLine': 200,
    'pointsDelivery': 20,
  };
  // Высота строки текста в px
  const heightLineTspan = 15;

  // Calculate total nodes, max label length
  let totalNodes = 0;
  let maxLabelLength = 0;
  let maxLabelHeight = 0;
  // variables for drag/drop
  let selectedNode = null;
  // Misc. variables
  let i = 0;
  const duration = 750;
  let root;
  let svgGroup;

  // size of the diagram
  const viewerWidth = window.innerWidth;
  const viewerHeight = window.innerHeight;

  let tree = d3.layout.tree()
  .size([viewerHeight, viewerWidth]);

  // define a d3 diagonal projection for use by the node paths later on.
  const diagonal = d3.svg.diagonal()
  .projection((d) => {
    return [d.y, d.x];
  });

  // Define the zoom function for the zoomable tree

  function zoom() {
    svgGroup.attr("transform",
      `translate(${d3.event.translate})scale(${d3.event.scale})`);
    renderScaleBar(d3.event.scale)
  }

  // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
  const zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

  // define the baseSvg, attaching a class for styling and the zoomListener
  const baseSvg = d3.select("#tree-container").append("svg")
  .attr("width", viewerWidth)
  .attr("height", viewerHeight)
  .attr("class", "overlay")
  .call(zoomListener);

  // Append a group which holds all nodes and which the zoom Listener can act upon.
  svgGroup = baseSvg.append("g");

  // A recursive helper function for performing some setup by walking through all nodes

  function visit(parent, visitFn, childrenFn) {
    if (!parent) return;

    visitFn(parent);

    const children = childrenFn(parent);
    if (children) {
      const count = children.length;
      for (let k = 0; k < count; k += 1) {
        visit(children[k], visitFn, childrenFn);
      }
    }
  }

  // Call visit function to establish maxLabelLength
  visit(treeData, (d) => {
    totalNodes += 1;
    maxLabelLength = Math.max(d.name.length, maxLabelLength);
    maxLabelHeight = Math.max(d.name.length / 20, maxLabelHeight);

  }, (d) => {
    return d.children && d.children.length > 0 ? d.children : null;
  });

  // sort the tree according to the node names

  function sortTree() {
    tree.sort((a, b) => {
      return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
    });
  }

  // Sort the tree initially incase the JSON isn't in a sorted order.
  sortTree();


  // Helper functions for collapsing and expanding nodes.

  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  function expand(d) {
    if (d._children) {
      d.children = d._children;
      d.children.forEach(expand);
      d._children = null;
    }
  }


  // Function to update the temporary connector indicating dragging affiliation
  const updateHighlightLine = () => {
    let data = [];
    if (selectedNode !== null) {
      // have to flip the source coordinates since we did this for the existing connectors on the original tree
      data = [{
        source: {
          x: selectedNode.source.x0,
          y: selectedNode.source.y0,
          type: selectedNode.source.type,
          right: selectedNode.source.right
        },
        target: {
          x: selectedNode.target.x0,
          y: selectedNode.target.y0,
          type: selectedNode.target.type,
          left: selectedNode.target.left
        }
      }];
    }
    const link = svgGroup.selectAll(".highlight").data(data);

    link.enter().append("path")
    .attr("class", "highlight")
    .attr('pointer-events', 'none')
    .style('marker-start',
      (d) => d.source.right ? `url(#start-arrow-highlight)` : '')
    .style('marker-end', (d) => d.target.left ? `url(#end-arrow-highlight)` : '')
    .attr("d", (d) => {
      const { source, target } = data[0];
      const dSourceY = source.type === "pointsDelivery" ? maxLabelHeight * 20 || 20 : dictWidth[source.type] || 50;
      const oSource = {
        x: source.x + maxLabelHeight * 10,
        y: source.y + dSourceY
      };
      const oTarget = {
        x: target.x + maxLabelHeight * 10,
        y: target.y - 5
      };
      return diagonal({
        source: oSource,
        target: oTarget
      });
    });

    link.exit().remove();
  };

  const overLine = (d) => {
    selectedNode = d;
    updateHighlightLine();
  };
  const outLine = (d) => {
    selectedNode = null;
    updateHighlightLine();
  };

  // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

  function centerNode(source) {
    const scale = zoomListener.scale();
    let x = -source.y0;
    let y = -source.x0;
    x = x * scale + viewerWidth / 2;
    y = y * scale + viewerHeight / 2;
    d3.select('g').transition()
    .duration(duration)
    .attr("transform", `translate(${x},${y})scale(${scale})`);
    zoomListener.scale(scale);
    zoomListener.translate([x, y]);
  }

  setCenterNode = (source) => {
    return centerNode(source)
  };


  function update(source) {

    // Compute the new height, function counts total children of root node and sets tree height accordingly.
    // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
    // This makes the layout more consistent.
    const levelWidth = [1];
    const childCount = (level, n) => {

      if (n.children && n.children.length > 0) {
        if (levelWidth.length <= level + 1) levelWidth.push(0);

        levelWidth[level + 1] += n.children.length;
        n.children.forEach((d) => {
          childCount(level + 1, d);
        });
      }
    };
    childCount(0, root);
    const newHeight = maxLabelHeight * 100;
    tree = tree.size([newHeight, viewerWidth]);

    // Compute the new tree layout.
    const nodes = tree.nodes(root).reverse();
    const links = tree.links(nodes);
    // // Set widths between levels based on maxLabelLength.
    let nextX;
    nodes.forEach((d, i) => {
      d.y = (d.depth * 300);
      if (i !== 0) {
        if (d.depth > nodes[i - 1].depth) {
          nextX = nextX - maxLabelHeight * 30;
        }
        if (d.depth === nodes[i - 1].depth) {
          nextX = nextX - maxLabelHeight * 30;
        }
        d.x = nextX;
      }
      if (i === 0) {
        nextX = d.x
      }
      // maxLabelLength * 10px
      // d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
      // alternatively to keep a fixed scale one can set a fixed depth per level
      // Normalize for fixed-depth by commenting out below line
      // d.y = (d.depth * 500); //500px per level.
    });
    // Update the nodes…
    let node = svgGroup.selectAll("g.node")
    .data(nodes, (d) => {
      return d.id || (d.id = i += 1);
    });

    // Enter any new nodes at the parent's previous position.
    const nodeEnter = node.enter().append("g")
    // .call(dragListener)
    .attr("class", "node")
    .attr('id', (d) => {
      return d.id
    })
    .attr('data', (d) => {
      return d.type
    })
    .attr("transform", (d) => {
      return `translate(${source.y0},${source.x0})`;
    });

    /** Прямоугольник для ПС/ВЛ/ТочкиПрис* */
    nodeEnter.append("rect")
    .attr('class', 'nodeCircle')
    .attr("rx", (d) => {
      return d.type === "pointsDelivery" ? maxLabelHeight * 20 || 20 : dictRadius[d.type] || 0;
    })
    .attr("width", (d) => {
      return d.type === "pointsDelivery" ? maxLabelHeight * 20 || 20 : dictWidth[d.type] || 50;
    })
    .attr("height", (d) => {
      return maxLabelHeight * 20 || 20;
    })
    .style("fill", (d) => {
      return dictVoltageClass[d.voltageClass] || "#fff";
    });

    /** СЛЕВА* */
    nodeEnter.append("circle")
    .attr("class", (d) => {
      return d.type === 'pointsDelivery' ? "ghost" : "nodeCircleParent";
    })
    .attr("r", 5)
    .style("stroke", "black")
    .attr("transform", (d) => {
      return "translate(-5,0)";
    })
    .on('click', clickParent);

    nodeEnter.append("use")
    .attr("class", (d) => {
      return d.type === 'pointsDelivery' ? "ghostMarker" : "parentMarker";
    })
    .attr('xlink:href', '')
    .attr('x', '-15')
    .attr('y', '0');

    /** СПРАВА* */
    nodeEnter.append("circle")
    .attr("class", (d) => {
      return d.type === 'pointsDelivery' ? "ghost" : "nodeCircleChildren";
    })
    .attr("r", 5)
    .attr("transform", (d) => {
      return `translate(${(dictWidth[d.type] || 50) + 5},0)`;
    })
    .style("stroke", "black")
    .on('click', clickChildren);

    nodeEnter.append("use")
    .attr("class", (d) => {
      return d.type === 'pointsDelivery' ? "ghostMarker" : "childrenMarker";
    })
    .attr('xlink:href', '')
    .attr('x', (d) => {
      return `${(dictWidth[d.type] || 50) - 5}`;
    })
    .attr('y', '0');

    function wrap(text, width) {
      text.each(function wrapping() {
        const thisText = d3.select(this);
        const textForPrinting = thisText.text();
        let position = 0;
        const words = [];
        while (position < textForPrinting.length) {
          words.push(textForPrinting.slice(position, position + 20));
          position += 20;
        }

        words.reverse();

        const x = thisText.attr("x");
        const dy = heightLineTspan;

        thisText.text(null); // чистит строку от текса для перезаписи
        let word = words.pop();
        while (word) {
          thisText.append("tspan")
          .attr("x", x)
          .attr("dy", dy)
          .text(word);
          word = words.pop()
        }
      })
    }


    /** ПОДПИСЬ узла * */
    nodeEnter.append("text")
    .attr("x", (d) => {
      return d.type === "pointsDelivery" ? maxLabelHeight * 10 || 20 : dictWidth[d.type] / 2 || 25;
    })
    .attr("y", (d) => {
      // считаем количество строк, максимальное количество символов 20
      const countLines = Math.ceil(d.name.length / 20);
      // Высота прямоугольника в котором размещается текст
      const height = maxLabelHeight * 20 || 20;
      // для нечетного количества строк
      // for an odd number of rows
      const quarter = countLines % 2 === 1 ? heightLineTspan / 4 : 0;
      return (height - heightLineTspan * countLines) / 2 - quarter;
    })
    .attr('class', 'nodeText')
    .attr("text-anchor", "middle")
    .text((d) => {
      return d.name
    })
    .call(wrap, 20)
    .style("fill-opacity", 0);


    /** Вторая подпись узла* */
    nodeEnter.append("text")
    .attr("x", (d) => {
      return d.type === "pointsDelivery" ? maxLabelHeight * 10 || 20 : dictWidth[d.type] / 2 || 25;
    })
    .attr("dy", (d) => {
      return (maxLabelHeight * 20 || 20) + heightLineTspan;
    })
    .attr('class', 'nodeText')
    .attr("text-anchor", "middle")
    .text((d) => {
      return d.typeProperty;
    })
    .style("fill-opacity", 1);


    /** Обновление свойств* */
    node.select("rect.nodeCircle")
    .style("fill", (d) => {
      return dictVoltageClass[d.voltageClass] || "#fff";
    });

    node.select("use.parentMarker")
    .attr('xlink:href', (d) => {
      if (d.type === 'pointsDelivery') return "";
      return d.parent && !nodes.some((node) => {
        return node.id === d.parent.id
      }) ? `#plus` : `#minus`;
    });
    node.select("use.childrenMarker")
    .attr('xlink:href', (d) => {
      if (d.type === 'pointsDelivery') return "";
      return d._children ? `#plus` : `#minus`;
    });

    // Transition nodes to their new position.
    const nodeUpdate = node.transition()
    .duration(duration)
    .attr("transform", (d) => {
      return `translate(${d.y},${d.x})`;
    });

    // Fade the text in
    nodeUpdate.select("text")
    .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    const nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", (d) => {
      return `translate(${source.y},${source.x})`;
    })
    .remove();

    nodeExit.select("circle")
    .attr("r", 0);

    nodeExit.select("text")
    .style("fill-opacity", 0);

    // Update the links…
    const link = svgGroup.selectAll("path.link")
    .data(links, (d) => {
      return d.target.id;
    });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
    .attr("class", "link")
    .style('marker-start',
      (d) => d.source.right ? `url(#start-arrow-${d.target.typeConnection})` : '')
    .style('marker-end', (d) => d.target.left ? `url(#end-arrow-${d.target.typeConnection})` : '')
    .on("mouseover", overLine)
    .on("mouseout", outLine)
    .attr("d", (d) => {
      const o = {
        x: source.x0,
        y: source.y0
      };
      return diagonal({
        source: o,
        target: o
      });
    })
    .style("stroke", (d) => {
      return dictTypeLine[d.target.typeConnection] || "#000"
    });

    // Transition links to their new position.
    link.transition()
    .duration(duration)
    .attr("d", (d) => {
      const dSourceY = d.source.type === "pointsDelivery" ? maxLabelHeight * 20 || 20 : dictWidth[d.source.type] || 50;
      const oSource = {
        x: d.source.x + maxLabelHeight * 10,
        y: d.source.right ? d.source.y + dSourceY + 2 : d.source.y + dSourceY
      };
      const oTarget = {
        x: d.target.x + maxLabelHeight * 10,
        y: d.target.left ? d.target.y - 5 : d.target.y
      };
      return diagonal({
        source: oSource,
        target: oTarget
      });
    });

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
    .duration(duration)
    .attr("d", (d) => {
      const o = {
        x: source.x,
        y: source.y
      };
      return diagonal({
        source: o,
        target: o
      });
    })
    .remove();

    // Stash the old positions for transition.
    nodes.forEach((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children function

  function toggleChildren(d) {
    if (d.children) {
      collapse(d);
    } else if (d._children) {
      d.children = d._children;
      d._children = null;
    }
    return d;
  }

  function toggleParrent(d) {
    if (d.id === root.id) {
      root = d.parent || treeData
    } else {
      root = d
    }
    return root;
  }

  function clickParent(d) {
    if (d3.event.defaultPrevented) return; // click suppressed
    d = toggleParrent(d);
    update(d);
    centerNode(d);
  }

  function clickChildren(d) {
    if (d3.event.defaultPrevented) return; // click suppressed
    d = toggleChildren(d);
    update(d);
    centerNode(d);
  }

  // Define the root
  root = treeData;
  root.x0 = viewerHeight / 2;
  root.y0 = 0;

  // Layout the tree initially and center on the root node.
  update(root);
  centerNode(root);

  // define arrow markers for graph links
  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'start-arrow-type1')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 4)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M20,-10L0,0L20,10')
  .attr('fill', dictTypeLine.type1);

  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'end-arrow-type1')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 6)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-10L20,0L0,10')
  .attr('fill', dictTypeLine.type1);
  /** ****************************************************************** */
  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'start-arrow-type2')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 4)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M20,-10L0,0L20,10')
  .attr('fill', dictTypeLine.type2);

  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'end-arrow-type2')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 6)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-10L20,0L0,10')
  .attr('fill', dictTypeLine.type2);
  /** ****************************************************************** */
  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'start-arrow-type3')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 4)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M20,-10L0,0L20,10')
  .attr('fill', dictTypeLine.type3);

  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'end-arrow-type3')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 6)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-10L20,0L0,10')
  .attr('fill', dictTypeLine.type3);
  /** ****************************************************************** */
  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'start-arrow-type4')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 4)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M20,-10L0,0L20,10')
  .attr('fill', dictTypeLine.type4);

  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'end-arrow-type4')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 6)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-10L20,0L0,10')
  .attr('fill', dictTypeLine.type4);

  /** СТРЕЛКИ ДЛЯ ПОДСТВЕТКИ********************************************************************* */
  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'start-arrow-highlight')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 4)
  .attr('markerWidth', 2)
  .attr('markerHeight', 2)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M20,-10L0,0L20,10')
  .attr('fill', 'rgba(0, 255, 0, 0.5)');

  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'end-arrow-highlight')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 6)
  .attr('markerWidth', 2)
  .attr('markerHeight', 2)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-10L20,0L0,10')
  .attr('fill', 'rgba(0, 255, 0, 0.5)');

  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'start-line-highlight')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 4)
  .attr('markerWidth', 2)
  .attr('markerHeight', 2)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M 0,0 20,0')
  .attr('fill', 'rgba(0, 255, 0, 0.5)');

  /** ПЛЮС-МИНУС********************************************************************************* */
  baseSvg.append('svg:defs').append('svg:g')
  .attr('id', 'plus')
  .append('svg:path')
  .attr('d', 'M 7.5,0 10,0 10,-2.5 10,2.5 10,0 12.5,0')
  .attr('fill', 'none')
  .attr('stroke', 'rgba(255, 0, 0, 1)');

  baseSvg.append('svg:defs').append('svg:g')
  .attr('id', 'minus')
  .append('svg:path')
  .attr('d', 'M 7.5,0 12.5,0')
  .attr('fill', 'rgba(0, 0, 255, 1)')
  .attr('stroke', 'rgba(0, 0, 255, 1)');
};


export {
  setCenterNode,
  treeJSON
}
