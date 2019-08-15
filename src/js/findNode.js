export default function findNode(id, nodes) {
  let resp = '';
  nodes.map((node) => {
    if (node.id === id) {
      resp = node
    }
  });

  return resp;
}
