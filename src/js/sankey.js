import * as d3 from 'd3';

export default function sanKey(maxLabelHeight, dictWidth) {
  var sankey = {},
    nodeWidth = 24,
    nodePadding = 8,
    size = [1, 1],
    nodes = [],
    links = [];

  sankey.nodeWidth = function (_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function (_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function (_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function (_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function (_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.layout = function (iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function () {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = function () {
    var curvature = .5;

    function link(d) {
      // var x0 = d.source.x + d.source.dx,
      //   x1 = d.target.x,
      //   xi = d3.interpolateNumber(x0, x1),
      //   x2 = xi(curvature),
      //   x3 = xi(1 - curvature),
      //   y0 = d.source.y + d.sy + d.dy / 2,
      //   y1 = d.target.y + d.ty + d.dy / 2;
      // return "M" + x0 + "," + y0
      //   + "C" + x2 + "," + y0
      //   + " " + x3 + "," + y1
      //   + " " + x1 + "," + y1;
      const { source, target } = d;
      if (source === target) {
        const { ring } = d;
        const { x = 0, y = 0 } = ring;
        const dSourceY = ring.type === "pointsDelivery" ? maxLabelHeight * 20 || 20 : dictWidth[ring.type] || 50;
        const R = maxLabelHeight * 10;
        const x1 = x + dSourceY - R;
        const y1 = y - 1;
        const x2 = x + dSourceY + 3;
        const y2 = y + R;
        return `M${x1} ${y1} A ${R} ${R}, 0, 1, 1 ${x2} ${y2}`;
      } else {
        const dSourceY = source.type === "pointsDelivery" ? maxLabelHeight * 20 || 20 : dictWidth[source.type] || 50;
        const x1 = source.x + dSourceY;
        const y1 = source.y + maxLabelHeight * 10;
        const x4 = target.x - 5;
        const y4 = target.y + maxLabelHeight * 10;
        const xq1 = (x1 + x4) / 2;
        const yq1 = y1;

        return `M${x1},${y1} C${xq1},${yq1} ${xq1},${y4} ${x4},${y4}`;
      }

    }

    link.curvature = function (_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  function findNode(id) {
    let resp = '';
    nodes.map((node) => {
      if (node.id === id) {
        resp =  node
      }
    });

    return resp;
  }

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {

    links.forEach(function (link) {
      var source = link.source,
        target = link.target;

      const nodeLinkSource = findNode(link.source);
      const nodeLinkTarget = findNode(link.target);
      if (source === target) {
        const nodeLinkSource = findNode(link.source);
        link.ring = nodeLinkSource;
        nodeLinkSource.ring = link;
      } else {
        if (typeof source === "string") source = link.source = nodeLinkSource;
        if (typeof target === "string") target = link.target = nodeLinkTarget;
        source.sourceLinks.push(link);
        target.targetLinks.push(link);
        // source.outLinks.push(link);
        // target.inLinks.push(link);
      }

    });
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function (node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      );
    });
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    var remainingNodes = nodes,
      nextNodes,
      x = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function (node) {
        node.x = x;
        node.dx = nodeWidth;
        node.sourceLinks.forEach(function (link) {
          if (nextNodes.indexOf(link.target) < 0) {
            nextNodes.push(link.target);
          }
        });
      });
      remainingNodes = nextNodes;
      ++x;
    }

    //
    moveSinksRight(x);
    const kx = (x - 1) === 0 ? 1 : (size[0] - nodeWidth) / (x - 1);
    scaleNodeBreadths(kx);
  }

  function moveSourcesRight() {
    nodes.forEach(function (node) {
      if (!node.targetLinks.length) {
        const min = d3.min(node.sourceLinks, function (d) {
          return d.target.x;
        });
        node.x = min - 1;
      }
    });
  }

  function moveSinksRight(x) {
    nodes.forEach(function (node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function (node) {
      node.x *= kx;
    });
  }

  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3.nest()
    .key(function (d) {
      return d.x;
    })
    .sortKeys(d3.ascending)
    .entries(nodes)
    .map(function (d) {
      return d.values;
    });

    //
    initializeNodeDepth();
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      // var ky = d3.min(nodesByBreadth, function(nodes) {
      //   return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      // });

      var ky = 1;
      nodes.map((node) => {
        ky = Math.max(node.name.length / 20, ky);
      });

      ky = ky * 20;

      nodesByBreadth.forEach(function (nodes) {
        nodes.forEach(function (node, i) {
          node.y = i;
          node.dy = node.value * ky;
        });
      });

      links.forEach(function (link) {
        //link.dy = link.value * ky;
        link.dy = 0
      });
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function (nodes, breadth) {
        nodes.forEach(function (node) {
          if (node.targetLinks.length) {
            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        let value = link.value || 1;
        return center(link.source) * value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function (nodes) {
        nodes.forEach(function (node) {
          if (node.sourceLinks.length) {
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        let value = link.value || 1;
        return center(link.target) * value;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function (nodes) {
        var node,
          dy,
          y0 = 0,
          n = nodes.length,
          i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function (node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function (node) {
      var sy = 0, ty = 0;
      node.sourceLinks.forEach(function (link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function (link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value || 1;
  }

  return sankey;
};
