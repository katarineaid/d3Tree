function changeParentMarker(id, svgGroup) {
  const marker = svgGroup.selectAll(`#node-${id}`).select("use.parentMarker")
  .attr('xlink:href', (d) => {
    if (d.type === 'pointsDelivery') return "";
    return d._targetLinks.length ? `#plus` : `#minus`;
  });
}

function collapseInBox(d, svgGroup) {
  d._targetLinks = [...d._targetLinks, ...d.targetLinks];
  d._targetLinks.map((link) => {
    const { source } = link;
    const { sourceLinks } = source;
    sourceLinks.map((sourceLink, index) => {
      if (sourceLink.target.node === d.node) {
        const svgSourceLinks = svgGroup.selectAll(`#link-${sourceLink.source.id}-${sourceLink.target.id}`)
        .attr("opacity", 0);

        source._sourceLinks.push(sourceLink);
        source.sourceLinks.splice(index, 1);
      }
    });
    if (sourceLinks.length === 0) {
      const svgSourceNode = svgGroup.selectAll(`#node-${source.id}`)
      .attr("opacity", 0);

      collapseInBox(source, svgGroup)
    }
  });
  d.targetLinks = [];
  changeParentMarker(d.id, svgGroup)
}

function expandInBox(d, svgGroup) {
  d.targetLinks = [...d.targetLinks,...d._targetLinks];
  d.targetLinks.map((link) => {
    const { source } = link;
    const { _sourceLinks } = source;
    const pastLength = source.sourceLinks.length;
    _sourceLinks.map((_sourceLink, index) => {
      if (_sourceLink.target.node === d.node) {
        const svgSourceLinks = svgGroup.selectAll(`#link-${_sourceLink.source.id}-${_sourceLink.target.id}`)
        .attr("opacity", 1);

        source.sourceLinks.push(_sourceLink);
        source._sourceLinks.splice(index, 1);
      }
    });
    if (pastLength === 0) {
      const svgSourceNode = svgGroup.selectAll(`#node-${source.id}`)
      .attr("opacity", 1);

      expandInBox(source, svgGroup)
    }
  });
  d._targetLinks = [];
  changeParentMarker(d.id, svgGroup)
}

export {
  collapseInBox,
  expandInBox
}
