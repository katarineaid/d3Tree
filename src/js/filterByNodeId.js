import * as d3 from 'd3';
import findNode from './findNode';
import { changeParentMarker } from './inBox'
import { changeChildrenMarker } from './outBox'

export default function filterByNodeId(json) {
  const forFilter = document.getElementById("message_filter").textContent;
  if (forFilter) {
    forFilter.map((item) => {
      const node = findNode(item, json.nodes);
      /** Сворачиваем исходящие линии * */
      node._sourceLinks = [...node._sourceLinks, ...node.sourceLinks];
      node.sourceLinks = [];
      node._sourceLinks.map((link) => {
        const svgTargetLinks = d3.selectAll(`#link-${link.source.id}-${link.target.id}`)
        .attr("opacity", 0);
        const { target } = link;
        const { targetLinks } = target;
        targetLinks.map((targetLink, index) => {
          if (targetLink.source.node === node.node) {
            target._targetLinks.push(targetLink);
            target.targetLinks.splice(index, 1);
            changeChildrenMarker(targetLink.source.id,  d3.selectAll('#svgGroup'))
          }
        });
      });
      /** Сворачиваем входящие линии * */
      node._targetLinks = [...node._targetLinks, ...node.targetLinks];
      node.targetLinks = [];
      node._targetLinks.map((link) => {
        const { source } = link;
        const { sourceLinks } = source;
        sourceLinks.map((sourceLink, index) => {
          if (sourceLink.target.node === node.node) {
            const svgSourceLinks = d3.selectAll(`#link-${sourceLink.source.id}-${sourceLink.target.id}`)
            .attr("opacity", 0);
            source._sourceLinks.push(sourceLink);
            source.sourceLinks.splice(index, 1);
            changeParentMarker(sourceLink.target.id,  d3.selectAll('#svgGroup'))
          }
        });
      });
      d3.selectAll(`#node-${item}`)
      .attr("opacity", 0);
    })
  }


}
