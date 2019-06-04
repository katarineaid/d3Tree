// Get JSON data
treeJSON = d3.json("flare.json", function (error, treeData) {

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
  const dictRadius = {
    'substation': 0,
    'powerLine': 5,
    'pointsDelivery': 20,
  };
  const dictWidth = {
    'substation': 50,
    'powerLine': 50,
    'pointsDelivery': 20,
  };
  const dictHeight = {
    'substation': 20,
    'powerLine': 20,
    'pointsDelivery': 20,
  };

  // Calculate total nodes, max label length
  var totalNodes = 0;
  var maxLabelLength = 0;
  // variables for drag/drop
  var selectedNode = null;
  var draggingNode = null;
  // panning variables
  var panSpeed = 200;
  var panBoundary = 20; // Within 20px from edges will pan when dragging.
  // Misc. variables
  var i = 0;
  var duration = 750;
  var root;

  // size of the diagram
  var viewerWidth = $(document).width();
  var viewerHeight = $(document).height();

  var tree = d3.layout.tree()
  .size([viewerHeight, viewerWidth]);

  // define a d3 diagonal projection for use by the node paths later on.
  var diagonal = d3.svg.diagonal()
  .projection(function (d) {
    return [d.y, d.x];
  });

  // A recursive helper function for performing some setup by walking through all nodes

  function visit(parent, visitFn, childrenFn) {
    if (!parent) return;

    visitFn(parent);

    var children = childrenFn(parent);
    if (children) {
      var count = children.length;
      for (var i = 0; i < count; i++) {
        visit(children[i], visitFn, childrenFn);
      }
    }
  }

  // Call visit function to establish maxLabelLength
  visit(treeData, function (d) {
    totalNodes++;
    maxLabelLength = Math.max(d.name.length, maxLabelLength);

  }, function (d) {
    return d.children && d.children.length > 0 ? d.children : null;
  });


  // sort the tree according to the node names

  function sortTree() {
    tree.sort(function (a, b) {
      return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
    });
  }

  // Sort the tree initially incase the JSON isn't in a sorted order.
  sortTree();

  // Define the zoom function for the zoomable tree

  function zoom() {
    svgGroup.attr("transform",
      "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }


  // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
  var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

  // define the baseSvg, attaching a class for styling and the zoomListener
  var baseSvg = d3.select("#tree-container").append("svg")
  .attr("width", viewerWidth)
  .attr("height", viewerHeight)
  .attr("class", "overlay")
  .call(zoomListener);


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

  var overLine = function (d) {
    selectedNode = d;
    updateHighlightLine();
  };
  var outLine = function (d) {
    selectedNode = null;
    updateHighlightLine();
  };

  // Function to update the temporary connector indicating dragging affiliation
  var updateHighlightLine = function () {
    var data = [];
    if (selectedNode !== null) {
      // have to flip the source coordinates since we did this for the existing connectors on the original tree
      data = [{
        source: {
          x: selectedNode.source.x0,
          y: selectedNode.source.y0
        },
        target: {
          x: selectedNode.target.x0,
          y: selectedNode.target.y0
        }
      }];
    }
    var link = svgGroup.selectAll(".highlight").data(data);

    link.enter().append("path")
    .attr("class", "highlight")
    .attr('pointer-events', 'none')
    .attr("d", function (d) {
      let { source, target } = data[0];
      let o_source = {
        x: source.x + 10,
        y: source.right ? source.y + 52 : source.y + 50
      };
      let o_target = {
        x: target.x + 10,
        y: target.left ? target.y - 5 : target.y
      };
      return diagonal({
        source: o_source,
        target: o_target
      });
    });

    link.exit().remove();
  };

  // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

  function centerNode(source) {
    scale = zoomListener.scale();
    x = -source.y0;
    y = -source.x0;
    x = x * scale + viewerWidth / 2;
    y = y * scale + viewerHeight / 2;
    d3.select('g').transition()
    .duration(duration)
    .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
    zoomListener.scale(scale);
    zoomListener.translate([x, y]);
  }

  // Toggle children function

  function toggleChildren(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
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

  function update(source) {
    // Compute the new height, function counts total children of root node and sets tree height accordingly.
    // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
    // This makes the layout more consistent.
    var levelWidth = [1];
    var childCount = function (level, n) {

      if (n.children && n.children.length > 0) {
        if (levelWidth.length <= level + 1) levelWidth.push(0);

        levelWidth[level + 1] += n.children.length;
        n.children.forEach(function (d) {
          childCount(level + 1, d);
        });
      }
    };
    childCount(0, root);
    var newHeight = d3.max(levelWidth) * 100; // 25 pixels per line
    tree = tree.size([newHeight, viewerWidth]);

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);
    // Set widths between levels based on maxLabelLength.
    nodes.forEach(function (d) {
      d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
      // alternatively to keep a fixed scale one can set a fixed depth per level
      // Normalize for fixed-depth by commenting out below line
      // d.y = (d.depth * 500); //500px per level.
    });

    // Update the nodes…
    node = svgGroup.selectAll("g.node")
    .data(nodes, function (d) {
      return d.id || (d.id = ++i);
    });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
    //.call(dragListener)
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    });

    /**Прямоугольник для ПС/ВЛ/ТочкиПрис**/
    nodeEnter.append("rect")
    .attr('class', 'nodeCircle')
    .attr("rx", function (d) {
      return dictRadius[d.type] || 0;
    })
    .attr("width", function (d) {
      return dictWidth[d.type] || 50;
    })
    .attr("height", function (d) {
      return dictHeight[d.type] || 20;
    })
    .style("fill", function (d) {
      return d._children ? "lightsteelblue" : "#fff";
    });

    /**СЛЕВА**/
    nodeEnter.append("circle")
    .attr('class', 'nodeCircleParent')
    .attr("r", 5)
    .style("stroke", "steelblue")
    .attr("transform", function (d) {
      return "translate(-5,0)";
    })
    .on('click', clickParent);

    /**СПРАВА**/
    nodeEnter.append("circle")
    .attr('class', 'nodeCircleChildren')
    .attr("r", 5)
    .attr("transform", function (d) {
      return "translate(55,0)";
    })
    .style("stroke", "red")
    .on('click', clickChildren);

    /**ПОДПИСЬ узла**/
    nodeEnter.append("text")
    .attr("x", function (d) {
      return d.children || d._children ? -10 : 10;
    })
    .attr("dy", 10)
    .attr('class', 'nodeText')
    .attr("text-anchor", function (d) {
      return d.children || d._children ? "end" : "start";
    })
    .text(function (d) {
      return d.name;
    })
    .style("fill-opacity", 0);

    // Update the text to reflect whether node has children or not.
    node.select('text')
    .attr("x", function (d) {
      return d.children || d._children ? -10 : 10;
    })
    .attr("text-anchor", function (d) {
      return d.children || d._children ? "end" : "start";
    })
    .text(function (d) {
      return d.name;
    });

    /**Обновление свойств**/
    node.select("rect.nodeCircle")
    .style("fill", function (d) {
      return d._children ? "lightsteelblue" : "#fff";
    });
    node.select("circle.nodeCircleParent")
    .attr("class", function (d) {
      return d.type === 'pointsDelivery' ? "ghost" : "";
    })
    .style("fill", function (d) {
      return d.parent && !nodes.some((node) => {
        return node.id === d.parent.id
      }) ? "lightsteelblue" : "#fff";
    });
    node.select("circle.nodeCircleChildren")
    .attr("class", function (d) {
      return d.type === 'pointsDelivery' ? "ghost" : "";
    })
    .style("fill", function (d) {
      return d._children ? "lightsteelblue" : "#fff";
    });

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
    .duration(duration)
    .attr("transform", function (d) {
      return "translate(" + d.y + "," + d.x + ")";
    });

    // Fade the text in
    nodeUpdate.select("text")
    .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", function (d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();

    nodeExit.select("circle")
    .attr("r", 0);

    nodeExit.select("text")
    .style("fill-opacity", 0);

    // Update the links…
    var link = svgGroup.selectAll("path.link")
    .data(links, function (d) {
      return d.target.id;
    });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
    .attr("class", "link")
    .style('marker-start',
      (d) => d.source.right ? `url(#start-arrow-${d.target.voltageClass})` : '')
    .style('marker-end', (d) => d.target.left ? `url(#end-arrow-${d.target.voltageClass})` : '')
    .on("mouseover", overLine)
    .on("mouseout", outLine)
    .attr("d", function (d) {
      var o = {
        x: source.x0,
        y: source.y0
      };
      return diagonal({
        source: o,
        target: o
      });
    })
    .style("stroke", function (d) {
      return dictVoltageClass[d.target.voltageClass] || "#000"
    });

    // Transition links to their new position.
    link.transition()
    .duration(duration)
    .attr("d", function (d) {
      var o_source = {
        x: d.source.x + 10,
        y: d.source.right ? d.source.y + 52 : d.source.y + 50
      };
      var o_target = {
        x: d.target.x + 10,
        y: d.target.left ? d.target.y - 5 : d.target.y
      };
      return diagonal({
        source: o_source,
        target: o_target
      });
    });

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
    .duration(duration)
    .attr("d", function (d) {
      var o = {
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
    nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Append a group which holds all nodes and which the zoom Listener can act upon.
  var svgGroup = baseSvg.append("g");

  // Define the root
  root = treeData;
  root.x0 = viewerHeight / 2;
  root.y0 = 0;

  // Layout the tree initially and center on the root node.
  update(root);
  centerNode(root);

  // define arrow markers for graph links
  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'end-arrow-110')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 6)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-10L20,0L0,10')
  .attr('fill', dictVoltageClass[110]);

  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'start-arrow-110')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 4)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M20,-10L0,0L20,10')
  .attr('fill', dictVoltageClass[110]);

  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'end-arrow-10')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 6)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-10L20,0L0,10')
  .attr('fill', dictVoltageClass[10]);

  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'start-arrow-10')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 4)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M20,-10L0,0L20,10')
  .attr('fill', dictVoltageClass[10]);
});