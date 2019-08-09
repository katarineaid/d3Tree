function renderScaleBar(scale) {
  const scaleBar = document.querySelector(".scale-bar");
  const scalePercent = Math.floor(scale * 100);
  scaleBar.textContent = `${scalePercent} %`
}
 export default renderScaleBar
