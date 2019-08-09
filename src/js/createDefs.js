export default function createDefs(baseSvg, dictTypeLine){
  // define arrow markers for graph links
  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'start-arrow-type1')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 4)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M20,-10L0,0L20,10')
  .attr('fill', dictTypeLine.type1);

  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'end-arrow-type1')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 6)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-10L20,0L0,10')
  .attr('fill', dictTypeLine.type1);
  /** ****************************************************************** */
  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'start-arrow-type2')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 4)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M20,-10L0,0L20,10')
  .attr('fill', dictTypeLine.type2);

  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'end-arrow-type2')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 6)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-10L20,0L0,10')
  .attr('fill', dictTypeLine.type2);
  /** ****************************************************************** */
  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'start-arrow-type3')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 4)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M20,-10L0,0L20,10')
  .attr('fill', dictTypeLine.type3);

  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'end-arrow-type3')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 6)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-10L20,0L0,10')
  .attr('fill', dictTypeLine.type3);
  /** ****************************************************************** */
  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'start-arrow-type4')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 4)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M20,-10L0,0L20,10')
  .attr('fill', dictTypeLine.type4);

  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'end-arrow-type4')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 6)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-10L20,0L0,10')
  .attr('fill', dictTypeLine.type4);

  /** СТРЕЛКИ ДЛЯ ПОДСТВЕТКИ********************************************************************* */
  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'start-arrow-highlight')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 4)
  .attr('markerWidth', 2)
  .attr('markerHeight', 2)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M20,-10L0,0L20,10')
  .attr('fill', 'rgba(0, 255, 0, 0.5)');

  baseSvg.append('svg:defs').append('svg:marker')
  .attr('id', 'end-arrow-highlight')
  .attr('viewBox', '0 -10 20 20')
  .attr('refX', 6)
  .attr('markerWidth', 2)
  .attr('markerHeight', 2)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-10L20,0L0,10')
  .attr('fill', 'rgba(0, 255, 0, 0.5)');

  /** ПЛЮС-МИНУС********************************************************************************* */
  baseSvg.append('svg:defs').append('svg:g')
  .attr('id', 'plus')
  .append('svg:path')
  .attr('d', 'M 7.5,0 10,0 10,-2.5 10,2.5 10,0 12.5,0')
  .attr('fill', 'none')
  .attr('stroke', 'rgba(255, 0, 0, 1)');

  baseSvg.append('svg:defs').append('svg:g')
  .attr('id', 'minus')
  .append('svg:path')
  .attr('d', 'M 7.5,0 12.5,0')
  .attr('fill', 'rgba(0, 0, 255, 1)')
  .attr('stroke', 'rgba(0, 0, 255, 1)');
}
