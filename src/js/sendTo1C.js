export default function sendTo1C(name, data) {
  // console.log('sendTo1C', JSON.stringify(data))
  const node = document.querySelectorAll('#message_out')[0];
  node.textContent = JSON.stringify(data)
  // const evt = document.createEventObject();
  // evt.propertyName 	= name;
  // evt.data    		= JSON.stringify(data);
  // evt.cancelBubble 	= true;
  // evt.returnValue  	= false;
  // document.fireEvent('onclick',evt)
}
