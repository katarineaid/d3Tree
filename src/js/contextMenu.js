import { setCenterNode } from './graph';
import sendTo1C from './sendTo1C';

const menu = document.querySelector("#context-menu");
let menuState = 0;
const active = "context-menu--active";
const classForContextMenu = "node";
const contextMenuLinkClassName = "context-menu__link";

let taskItemInContext;

let menuWidth;
let menuHeight;

let windowWidth;
let windowHeight;

let clickCoords;
let clickCoordsX;
let clickCoordsY;
let idNode = '';
let typeNode = '';
let currentSource = null;

function contain(el, className) {
  if (typeof el.className === 'string') {
    return el.className.indexOf(className) !== -1
  }
  if (typeof el.className === 'object') {
    return el.className.baseVal === className
  }
  return false
}

function clickInsideElement(event, className) {
  let el = event.target;
  if (contain(el, className)) {
    return el;
  }
  while (el.parentNode) {
    el = el.parentNode;
    if (contain(el, className)) {
      return el;
    }
  }

  return false;
}

function sharedData(nodeId) {
  const id = nodeId.replace('node-', '');
  sendTo1C('click', { nameEvent: 'sharedData', id })
}

function topology(nodeId) {
  const id = nodeId.replace('node-', '');
  sendTo1C('click', { nameEvent: 'topology', id })
}

function select(nodeId) {
  const id = nodeId.replace('node-', '');
  sendTo1C('click', { nameEvent: 'select', id });
  setCenterNode(currentSource)
}

function selectWindow(nodeId) {
  const id = nodeId.replace('node-', '');
  sendTo1C('click', { nameEvent: 'selectWindow', id })
}

function toggleMenuOn(event) {

  const currentNode = clickInsideElement(event, classForContextMenu);

  if (currentNode) {
    // eslint-disable-next-line no-underscore-dangle
    currentSource = currentNode.__data__;
    typeNode = currentSource.type;
    idNode = currentSource.id
  }

  if (typeNode === "pointsDelivery") {
    /** Обработка для точки поставки* */
    selectWindow(idNode);
  } else {
    menuState = 1;
    menu.className += ` ${active}`;
  }

}

function toggleMenuOff() {
  idNode = '';
  menuState = 0;
  menu.className = menu.className.replace(active, '')
}


function menuItemListener(link) {

  const dictActions = {
    sharedData,
    topology,
    select,
    selectWindow,
  };

  const id = link.getAttribute("id");
  const func = dictActions[id];
  func(idNode);
  toggleMenuOff();
}


/**
 * Listens for click events.
 * Обработка события click.
 */
function clickListener() {
  document.addEventListener("click", function listener(event) {
    const elementIsLink = clickInsideElement(event, contextMenuLinkClassName);
    if (elementIsLink) {
      event.preventDefault();
      menuItemListener(elementIsLink);
    } else if (menuState === 1) {
      toggleMenuOff();
    }
  }, true);
}

/**
 * Listens for keyup events.
 * Обработка события keyup.
 */
function keyupListener() {
  window.onkeyup = function keyup(e) {
    if (e.key === "Escape") {
      toggleMenuOff();
    }
  }
}

function resizeListener() {
  window.onresize = function resize() {
    toggleMenuOff();
  };
}


function init() {
  clickListener();
  keyupListener();
  resizeListener();
}


/**
 * Run the app.
 * Запуск приложения.
 */
init();

function getPosition(e) {
  let posx = 0;
  let posy = 0;

  if (e.pageX || e.pageY) {
    posx = e.pageX;
    posy = e.pageY;
  } else if (e.clientX || e.clientY) {
    posx = e.clientX + document.body.scrollLeft +
      document.documentElement.scrollLeft;
    posy = e.clientY + document.body.scrollTop +
      document.documentElement.scrollTop;
  }
  return {
    x: posx,
    y: posy
  }
}

function positionMenu(e) {
  clickCoords = getPosition(e);
  clickCoordsX = clickCoords.x;
  clickCoordsY = clickCoords.y;

  menuWidth = menu.offsetWidth;
  menuHeight = menu.offsetHeight;

  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;

  if ((windowWidth - clickCoordsX) < menuWidth) {
    menu.style.left = `${windowWidth - menuWidth}px`;
  } else {
    menu.style.left = `${clickCoordsX}px`;
  }

  if ((windowHeight - clickCoordsY) < menuHeight) {
    menu.style.top = `${windowHeight - menuHeight}px`;
  } else {
    menu.style.top = `${clickCoordsY}px`;
  }
}

/**
 * Навешивание событий на node
 * * */

function contextMenuListener() {
  document.addEventListener("contextmenu", function listener(event) {
    taskItemInContext = clickInsideElement(event, classForContextMenu);
    if (taskItemInContext) {
      event.preventDefault();
      toggleMenuOn(event);
      positionMenu(event);
    } else {
      taskItemInContext = null;
      toggleMenuOff();
    }
  }, true);
}


export default contextMenuListener;
