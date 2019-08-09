function changeChildrenMarker(id, svgGroup) {
  const marker = svgGroup.selectAll(`#node-${id}`).select("use.childrenMarker")
  .attr('xlink:href', (d) => {
    if (d.type === 'pointsDelivery') return "";
    return d._sourceLinks.length ? `#plus` : `#minus`;
  });
}
function collapseOutBox(d,svgGroup) {
  d._sourceLinks = [...d._sourceLinks, ...d.sourceLinks];
  const svgRingLinks = svgGroup.selectAll(`#link-${d.id}-${d.id}`)
  .attr("opacity", 0);
  d._sourceLinks.map((link) => {
    const svgTargetLinks = svgGroup.selectAll(`#link-${link.source.id}-${link.target.id}`)
    .attr("opacity", 0);
    const { target } = link;
    const { targetLinks } = target;
    targetLinks.map((targetLink, index) => {
      if (targetLink.source.node === d.node) {
        target._targetLinks.push(targetLink);
        target.targetLinks.splice(index, 1);
      }
    });
    if (targetLinks.length === 0) {
      const svgTargetNode = svgGroup.selectAll(`#node-${target.id}`)
      .attr("opacity", 0);
      collapseOutBox(target,svgGroup)
    }

  });
  d.sourceLinks = [];
  changeChildrenMarker(d.id, svgGroup)
}

function expandOutBox(d, svgGroup) {
  d.sourceLinks = [...d.sourceLinks, ...d._sourceLinks];
  const svgRingLinks = svgGroup.selectAll(`#link-${d.id}-${d.id}`)
  .attr("opacity", 1);
  d.sourceLinks.map((link) => {
    const svgTargetLinks = svgGroup.selectAll(`#link-${link.source.id}-${link.target.id}`)
    .attr("opacity", 1);
    const { target } = link;
    const { _targetLinks } = target;
    const pastLength = target.targetLinks.length;
    _targetLinks.map((_targetLink, index) => {
      if (_targetLink.source.node === d.node) {
        target.targetLinks.push(_targetLink);
        target._targetLinks.splice(index, 1);
      }
    })
    if (pastLength === 0) {
      const svgTargetNode = svgGroup.selectAll(`#node-${target.id}`)
      .attr("opacity", 1);
      expandOutBox(target, svgGroup)
    }
  });

  d._sourceLinks = [];
  changeChildrenMarker(d.id, svgGroup)
}


export {
  collapseOutBox,
  expandOutBox
}
