import findNode from './findNode';

export default function sanKey(maxLabelHeight, dictWidth) {
  var sankey = {},
    nodeWidth = 400,
    nodeHeight = 50,
    size = [1, 1],
    nodes = [],
    links = [],
    setNodesWithoutIN = new Set(),
    arrayNodesWithoutIN = [],
    setForPrint = new Set();
  const indexLayer = {};

  sankey.nodeWidth = function (_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodeHeight = function (_) {
    if (!arguments.length) return nodeHeight;
    nodeHeight = +_;
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

  sankey.layout = function () {
    computeNodeLinks();
    computeNodeDeep();
    return sankey;
  };

  sankey.link = function () {

    function link(d) {
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

    return link;
  };

  sankey.comNodes = () => {
    return [...setForPrint]
  };

  function dfs(node, indexDepth) {
    indexDepth = indexDepth + 1;
    node.color = 'grey';
    node.x = indexDepth * nodeWidth;
    indexLayer[indexDepth] = (indexLayer[indexDepth] || indexDepth) + 1;
    node.y = indexLayer[indexDepth] * nodeHeight;
    setForPrint.add({
      id: node.id,
      depth: node.depth,
      indexLayer: node.indexLayer,
      name: node.name,
    });
    for (let i = 0; i < node.outNodes.length; i++) {
      let outNode = node.outNodes[i];
      if (outNode.color === 'white') {
        dfs(outNode, indexDepth)
      } else {
        outNode.color = 'black';
      }
    }
  }

  function computeNodeDeep() {
    arrayNodesWithoutIN.map((ancestor, index) => {
      // if (index > 0) {
      //   const keys = Object.keys(indexLayer);
      //   let max = 0;
      //   keys.map((key) => {
      //     max = indexLayer[key] > max ? indexLayer[key] : max;
      //   });
      //   console.log("max index Layer", max);
      // }
      dfs(ancestor, 0)
    });
  }

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {

    links.forEach((link) => {
      const { source, target } = link;
      const nodeLinkSource = findNode(source, nodes);
      const nodeLinkTarget = findNode(target, nodes);
      if (source === target) {
        link.ring = nodeLinkSource;
        nodeLinkSource.ring = link;
      } else {
        link.source = nodeLinkSource;
        link.target = nodeLinkTarget;
        nodeLinkSource.outNodes.push(nodeLinkTarget);
        nodeLinkSource.outLinks.push(link);
        nodeLinkTarget.inLinks.push(link);

        nodeLinkSource.sourceLinks.push(link);
        nodeLinkTarget.targetLinks.push(link);


        if (nodeLinkSource.inLinks.length === 0) {
          setNodesWithoutIN.add(nodeLinkSource)
        }
      }

    });

    arrayNodesWithoutIN = [...setNodesWithoutIN];
  }

  return sankey;
};
