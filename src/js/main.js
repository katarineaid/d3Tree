import * as d3 from "d3";
import { graphJSON } from "./graph";
import contextMenuListener from './contextMenu';
import merge from './mergeData';

let json = {
  "nodes": [],
  "links": [],
};

function readData() {
  // const data = document.getElementById("message_in").textContent;
  const data = JSON.stringify({
    "nodes": [
      {
        "name": "0_ПС 110 кВ Мельничный ручей (ПС403)",
        "type": "substation",
        "typeProperty": "Объекты РСК",
        "id": "518853fb-5c21-11e7-80e6-00155d0c0908",
        "voltageClass": 110,
        "leftChildren": false,
        "rightChildren": false
      },
      {
        "name": "1_ВЛ 110 кВ Мельничный Ручей - Щеглово (ВЛ 35 кВ Щегловская-2)",
        "type": "powerLine",
        "typeProperty": "Объекты РСК",
        "id": "518853fb-5c21-11e7-80e6-00155d0c0907",
        "voltageClass": 110,
        "leftChildren": false,
        "rightChildren": false
      },
      {
        "name": "2",
        "type": "substation",
        "typeProperty": "Объекты РСК",
        "id": "012cea47-6c2a-11e7-80e6-00155d0c8907",
        "voltageClass": 10,
        "leftChildren": false,
        "rightChildren": false
      },
      {
        "name": "3_ПС 35 кВ Щеглово (ПС 631)",
        "type": "substation",
        "typeProperty": "Объекты РСК",
        "id": "012cea42-5c2a-11e7-80e6-00155d0c0907",
        "voltageClass": 330,
        "leftChildren": false,
        "rightChildren": false
      }
    ],
    "links": [
      {
        "source": "518853fb-5c21-11e7-80e6-00155d0c0908",
        "target": "012cea47-6c2a-11e7-80e6-00155d0c8907",
        "value": 1,
        "typeConnection": "type1",
        "left": false,
        "right": true
      },
      {
        "source": "518853fb-5c21-11e7-80e6-00155d0c0907",
        "target": "012cea47-6c2a-11e7-80e6-00155d0c8907",
        "value": 1,
        "typeConnection": "type2",
        "left": false,
        "right": true
      },
      {
        "source": "518853fb-5c21-11e7-80e6-00155d0c0907",
        "target": "012cea42-5c2a-11e7-80e6-00155d0c0907",
        "value": 1,
        "typeConnection": "type3",
        "left": false,
        "right": true
      },

      {
        "source": "012cea47-6c2a-11e7-80e6-00155d0c8907",
        "target": "012cea42-5c2a-11e7-80e6-00155d0c0907",
        "value": 1,
        "typeConnection": "type4",
        "left": false,
        "right": true
      },
      {
        "source": "012cea42-5c2a-11e7-80e6-00155d0c0907",
        "target": "012cea42-5c2a-11e7-80e6-00155d0c0907",
        "value": 4,
        "typeConnection": "type2",
        "left": false,
        "right": true
      }
    ]
  });
  if (data) {
    const dataForRender = merge(json, JSON.parse(data));
    d3.selectAll("svg").remove();
    json = dataForRender;
    graphJSON(null, json);

    contextMenuListener()
  } else {
    alert('Данные не получены')
  }

}

function second() {
  const jsonb = {
    "nodes": [
      {
        "name": "0_ПС 110 кВ Мельничный ручей (ПС403)",
        "type": "substation",
        "typeProperty": "Объекты РСК",
        "id": "518853fb-5c21-11e7-80e6-00155d0c0908",
        "voltageClass": 110,
        "leftChildren": false,
        "rightChildren": false
      },
      {
        "name": "0",
        "type": "substation",
        "typeProperty": "Объекты РСК",
        "id": "518853fb-5c21-11e7-80e6-10155d0c0908",
        "voltageClass": 110,
        "leftChildren": false,
        "rightChildren": false
      }
    ],
    "links": [
      {
        "source": "518853fb-5c21-11e7-80e6-10155d0c0908",
        "target": "518853fb-5c21-11e7-80e6-00155d0c0908",
        "value": 1,
        "typeConnection": "type3",
        "left": false,
        "right": true
      },
    ]
  };
  if (jsonb) {
    const dataForRender = merge(json, jsonb);
    d3.selectAll("svg").remove();
    json = dataForRender;
    graphJSON(null, json);

    contextMenuListener()
  } else {
    alert('Данные не получены')
  }
}

window.onload = () => {
  document.getElementById("sendToHTML").addEventListener('click', readData, true);
  document.getElementById("secondSendToHTML").addEventListener('click', second, true);
};

window.onresize = () => {
  d3.select("svg")
  .attr("width", window.innerWidth)
  .attr("height", window.innerHeight)
};
