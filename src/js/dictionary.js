const dictVoltageClass = {
  1150: 'rgba(205,138,255,1)',
  800: 'rgba(0,0,168,1)',
  750: 'rgba(0,0,168,1)',
  500: 'rgba(213,0,0,1)',
  400: 'rgba(255,100,30,1)',
  330: 'rgba(0,170,0,1)',
  220: 'rgba(181,181,0,1)',
  150: 'rgba(170,150,0,1)',
  110: 'rgba(0,153,255,1)',
  60: 'rgba(255,51,204,1)',
  35: 'rgba(102,51,0,1)',
  20: 'rgba(160,32,240,1)',
  15: 'rgba(160,32,240,1)',
  10: 'rgba(102,0,240,1)',
  6: 'rgba(0,102,0,1)',
  3: 'rgba(0,102,0,1)',
  0: 'rgba(127,127,127,1)'
};
const dictTypeLine = {
  'type1': 'rgba(128,128,128,1)',
  'type2': 'rgba(0,0,255,1)',
  'type3': 'rgba(255,165,0,1)',
  'type4': 'rgba(255,0,0,1)',
};
const dictRadius = {
  'substation': 0,
  'powerLine': 5,
  'pointsDelivery': 20,
};
const dictWidth = {
  'substation': 200,
  'powerLine': 200,
  'pointsDelivery': 20,
};

// Высота строки текста в px
const heightLineTspan = 15;


export {
  dictVoltageClass,
  dictTypeLine,
  dictRadius,
  dictWidth,
  heightLineTspan
}