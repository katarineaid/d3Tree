import * as d3 from 'd3';
import { heightLineTspan } from './dictionary';

export default function wrap(text, width) {
  text.each(function wrapping() {
    const thisText = d3.select(this);
    const textForPrinting = thisText.text();
    let position = 0;
    const words = [];
    while (position < textForPrinting.length) {
      words.push(textForPrinting.slice(position, position + 20));
      position += 20;
    }

    words.reverse();

    const x = thisText.attr("x");
    const dy = heightLineTspan;

    thisText.text(null); // чистит строку от текса для перезаписи
    let word = words.pop();
    while (word) {
      thisText.append("tspan")
      .attr("x", x)
      .attr("dy", dy)
      .text(word);
      word = words.pop()
    }
  })
}