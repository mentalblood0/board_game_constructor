"use strict";function composeExpressionWithParameters(e,t){return`${Object.keys(t).map((e=>`const ${e} = ${t[e]};`)).join("\n")};\n${e}`}function evaluate(expression){return eval(expression)}function evaluateExpressionWithParameters(expression,parameters){return eval(composeExpressionWithParameters(expression,parameters))}function computeGeometry(e,t){return e.geometry.map((e=>e.map((e=>{if("number"==typeof e)return e;if("string"!=typeof e)return;return evaluate(composeExpressionWithParameters(e,t))}))))}function composeSizedPoints(e,t){return e.map((e=>[t*e[0],t*e[1]]))}function computeCellScreenSize(e){return{width:Math.max(...e.map((e=>e[0]))),height:Math.max(...e.map((e=>e[1])))}}const default_cell_colors={fill:'"darkgrey"',selector:'"skyblue"',highlighter:'"lightgreen"'};function composeZoomedGeometry(e,t){const i=e.reduce(((e,t)=>[e[0]+t[0],e[1]+t[1]])).map((t=>t/e.length));return e.map((e=>[i[0]+t*(e[0]-i[0]),i[1]+t*(e[1]-i[1])]))}function Cell(e){var t,i,r;const{cell_config:o,resources:s,coordinates:l,size:n,figure_rotation_angle:a,figure:c,player:u,selected:p,highlighted:m,handleSelectThisCell:g}=e,f=composeSizedPoints(computeGeometry(o,l),n),{width:d,height:y}=computeCellScreenSize(f),x=evaluateExpressionWithParameters(o.position.x,l)*n,v=evaluateExpressionWithParameters(o.position.y,l)*n,$=Object.assign({},default_cell_colors,o.colors||{});let P;return Object.keys($).map((e=>$[e]=evaluateExpressionWithParameters($[e],l))),null!=s&&null!==(t=s.images)&&void 0!==t&&t.figures&&null!=s&&null!==(i=s.images)&&void 0!==i&&i.figures[u]&&(P=null==s||null===(r=s.images)||void 0===r?void 0:r.figures[u][c]),h("div",{className:"cellWithFigure",style:{width:`${d}px`,height:`${y}px`,transform:`translate(${x}px, ${v}px)`}},h("svg",{className:"cell",style:{width:"100%",height:"100%"},xmlns:"http://www.w3.org/2000/svg",version:"1.1",onClick:g},h("polygon",{fill:$.fill,points:f.join(" ")}),p?h("polygon",{style:{opacity:.6},fill:$.selector,points:f.join(" ")}):m?h("polygon",{style:{opacity:.6},fill:$.highlighter,points:f.join(" ")}):null),c?h("img",{className:"figure",style:{transform:`rotate(${a}deg)`},src:P,alt:`${u} ${c}`,draggable:!1,onClick:g}):null)}