import * as d3 from "d3";
import sanKey from './sankey';
import renderScaleBar from './scaleBar';
import createDefs from './createDefs';
import { expandOutBox, collapseOutBox } from './outBox';
import { expandInBox, collapseInBox } from './inBox';
import sendTo1C from './sendTo1C';
import wrap from './wrapText';
import {
  dictVoltageClass,
  dictTypeLine,
  dictRadius,
  dictWidth,
  heightLineTspan
} from './dictionary'


let setCenterNode;

function graphJSON(error, graph) {

  let svgGroup;
  let maxLabelLength = 0;
  let maxLabelHeight = 1;
  let selectedNode = null;

  graph.nodes.map((node) => {
    maxLabelLength = Math.max(node.name.length, maxLabelLength);
    const countString = Math.ceil(node.name.length / 20);
    maxLabelHeight = Math.max(countString, maxLabelHeight);
  });

  function zoomed() {
    const scale = d3.event.transform.k || 1;
    const x = d3.event.transform.x || 0;
    const y = d3.event.transform.y || 0;
    svgGroup.attr("transform", `translate(${x}, ${y})scale(${scale})`);
    renderScaleBar(scale);
  }

  // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
  const zoomListener = d3.zoom().scaleExtent([0.1, 3]).on("zoom", zoomed);

  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#tree-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

  const zoomer = svg.append("rect")
  .attr("width", width)
  .attr("height", height)
  .style("fill", "none")
  .style("pointer-events", "all")
  .call(zoomListener);

  svgGroup = svg.append("g").attr('id', 'svgGroup');


  function centerNode(source) {
    const scale = 1;
    const x = -source.x;
    const y = -source.y;
    const cX = x + width / 2;
    const cY = y + height / 2;
    svgGroup.transition()
    .duration(500)
    .attr("transform", `translate(${cX}, ${cY})scale(${scale})`)
    .on("end", () => {
      zoomer.call(zoomListener.transform,
        d3.zoomIdentity.translate(cX, cY).scale(scale))
    });
  }


  setCenterNode = (source) => {
    return centerNode(source)
  };


  // Set the sankey diagram properties
  d3.sankey = sanKey;
  var sankey = d3.sankey(maxLabelHeight, dictWidth)
  .nodeWidth(330)
  .nodeHeight(maxLabelHeight * 20 + 30 || 50)
  .size([width, height]);


  // Constructs a new Sankey generator with the default settings.
  sankey
  .nodes(graph.nodes)
  .links(graph.links)
  .layout(1);


  function clickOutBox(d) {
    if (d._sourceLinks.length) {
      expandOutBox(d, svgGroup)
    } else if (!d._sourceLinks.length && !d.sourceLinks.length && d.rightChildren) {
      sendTo1C('click', { nameEvent: "getOutBox", id: d.id })
    } else {
      collapseOutBox(d, svgGroup)
    }
  }

  function clickInBox(d) {
    if (d._targetLinks.length) {
      expandInBox(d, svgGroup)
    } else if (!d._targetLinks.length && !d.targetLinks.length && d.leftChildren) {
      sendTo1C('click', { nameEvent: "getInBox", id: d.id })
    } else {
      collapseInBox(d, svgGroup)
    }
  }


  /** High link* */
  var linkHighlight = svgGroup.append("g")
  .selectAll(".highlight")
  .data(graph.links)
  .enter()
  .append("path")
  .attr("class", "highlight")
  .attr("d", sankey.link())
  .attr('id', (d) => {
    return `link-${d.source.id || d.ring.id}-${d.target.id || d.ring.id}`
  })
  .sort(function (a, b) {
    return b.dy - a.dy;
  });

  // add in the links
  var link = svgGroup.append("g")
  .selectAll(".link")
  .data(graph.links)
  .enter()
  .append("path")
  .attr("class", "link")
  .attr("d", sankey.link())
  .style('marker-end',
    (d) => d.right ? `url(#end-arrow-${d.typeConnection})` : '')
  .style('marker-start', (d) => d.left ? `url(#start-arrow-${d.typeConnection})` : '')
  .style("stroke", (d) => {
    return dictTypeLine[d.typeConnection] || "#000"
  })
  .attr('id', (d) => {
    return `link-${d.source.id || d.ring.id}-${d.target.id || d.ring.id}`
  })
  .sort(function (a, b) {
    return b.dy - a.dy;
  });

  // add in the nodes
  var node = svgGroup.append("g")
  .selectAll(".node")
  .data(sankey.nodes())
  .enter().append("g")
  .attr("class", "node")
  .attr('id', (d) => {
    return `node-${d.id}`
  })
  .attr("transform", function (d) {
    return "translate(" + d.x + "," + d.y + ")";
  });

  // add the rectangles for the nodes
  node
  .append("rect")
  .attr("rx", (d) => {
    return d.type === "pointsDelivery" ? maxLabelHeight * 20 || 20 : dictRadius[d.type] || 0;
  })
  .attr("height", function (d) {
    //return d.dy;
    return maxLabelHeight * 20 || 20;
  })
  .attr("width", (d) => {
    return d.type === "pointsDelivery" ? maxLabelHeight * 20 || 20 : dictWidth[d.type] || 50;
  })
  .style("fill", (d) => {
    return dictVoltageClass[d.voltageClass] || "#fff";
  });


  /** СЛЕВА* */
  node.append("circle")
  .attr("class", (d) => {
    return d.type === 'pointsDelivery' ? "ghost" : "nodeCircleParent";
  })
  .attr("r", 5)
  .style("stroke", "black")
  .attr("transform", (d) => {
    return "translate(-5,0)";
  })
  .on('click', clickInBox);

  node.append("use")
  .attr("class", (d) => {
    return d.type === 'pointsDelivery' ? "ghostMarker" : "parentMarker";
  })
  .attr('xlink:href', '')
  .attr('x', '-15')
  .attr('y', '0');

  /** СПРАВА* */
  node.append("circle")
  .attr("class", (d) => {
    return d.type === 'pointsDelivery' ? "ghost" : "nodeCircleChildren";
  })
  .attr("r", 5)
  .attr("transform", (d) => {
    return `translate(${(dictWidth[d.type] || 50) + 5},0)`;
  })
  .style("stroke", "black")
  .on('click', clickOutBox);

  node.append("use")
  .attr("class", (d) => {
    return d.type === 'pointsDelivery' ? "ghostMarker" : "childrenMarker";
  })
  .attr('xlink:href', '')
  .attr('x', (d) => {
    return `${(dictWidth[d.type] || 50) - 5}`;
  })
  .attr('y', '0');

  /** ПЛЮС-МИНУС МАРКЕРЫ* */
  node.select("use.parentMarker")
  .attr('xlink:href', (d) => {
    if (d.type === 'pointsDelivery') return "";
    if (!d._targetLinks.length && !d.targetLinks.length && d.leftChildren) return `#plus`;
    return d._targetLinks.length ? `#plus` : `#minus`;
  });
  node.select("use.childrenMarker")
  .attr('xlink:href', (d) => {
    if (d.type === 'pointsDelivery') return "";
    if(!d._sourceLinks.length && !d.sourceLinks.length && d.rightChildren) return `#plus`;
    return d._sourceLinks.length ? `#plus` : `#minus`;
  });

  /** ПОДПИСЬ узла * */
  node.append("text")
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
  .call(wrap, 20);


  /** Вторая подпись узла* */
  node.append("text")
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
  });

  createDefs(svg, dictTypeLine)
}


export {
  setCenterNode,
  graphJSON
}
