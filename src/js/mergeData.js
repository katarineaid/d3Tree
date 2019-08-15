export default function merge(prevData, curData) {
  const { nodes: curNodes, links: curLinks } = curData;
  const { nodes: prevNodes, links: prevLinks } = prevData;
  const hashPrevNodes = {};
  const hashPrevLinks = {};
  const result = { ...prevData };
  prevNodes.map((prevNode) => {
    hashPrevNodes[prevNode.id] = prevNode.id;
  });
  prevLinks.map((prevLink) => {
    const { source, target } = prevLink;
    hashPrevLinks[`${source}-${target}`] = `${source}-${target}`
  });
  curNodes.map((curNode) => {
    if (!hashPrevNodes[curNode.id]) {
      const upCurNode = {
        ...curNode,
        sourceLinks: [],
        targetLinks: [],
        _sourceLinks: [],
        _targetLinks: [],
        outNodes: [],
        inLinks: [],
        outLinks: [],
        color: 'white',
        x: -1000,
        y: -1000,
        node: curNode.id,
      };
      result.nodes = [...result.nodes, upCurNode]
    }
  });
  curLinks.map((curLink) => {
    const { source, target } = curLink;
    const key = `${source}-${target}`;
    if (!hashPrevLinks[key]) {
      result.links = [...result.links, curLink]
    }
  });

  if (result.nodes.length === 1 && result.links.length === 0) {
    result.nodes[0].x = 500;
    result.nodes[0].y = 500
  }
  return result
}
