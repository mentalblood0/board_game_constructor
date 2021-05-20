"use strict";function getAllElementsWithDepth_(e,t,s,o){for(const r of Object.keys(e)){const i=e[r],n=o.concat([r]);0==t?s.push({keys:n,element:i}):getAllElementsWithDepth_(i,t-1,s,n)}}function getAllElementsWithDepth(e,t){const s=[];return getAllElementsWithDepth_(e,t,s,[]),s}function dictFromTwoLists(e,t){const s={};for(let o=0;o<e.length;o++)s[e[o]]=t[o];return s}class Root extends React.Component{constructor(e){super(e),this.state={board:void 0,selected_cell:void 0,config_text:void 0,config:{players:["white","black"],board:[],cell:["x","y"],figures:{intellector:{movement:[{x:1,also_reversed:!0},{y:1,also_reversed:!0},{x:1,y:-1,also_reversed:!0}],destination_cell_figure:{allied:[{action:"swap",if:{figure:"defensor"}}]}},defensor:{movement:[{x:1,also_reversed:!0},{y:1,also_reversed:!0},{x:1,y:-1,also_reversed:!0}]},dominator:{movement:[{x:1,repeat:!0,also_reversed:!0},{y:1,repeat:!0,also_reversed:!0},{x:1,y:-1,repeat:!0,also_reversed:!0}]},aggressor:{movement:[{x:1,y:1,repeat:!0,also_reversed:!0},{x:1,y:-2,repeat:!0,also_reversed:!0},{x:2,y:-1,repeat:!0,also_reversed:!0}]},liberator:{movement:[{x:2,also_reversed:!0,jump:!0},{y:2,also_reversed:!0,jump:!0},{x:2,y:-2,also_reversed:!0,jump:!0}]},progressor:{movement:{white:[{x:1},{y:1},{x:-1,y:1}],black:[{x:-1},{y:-1},{x:1,y:-1}]}}},initial_position:{white:{intellector:[{x:4,y:-2}],dominator:[{x:0,y:0},{x:8,y:-4}],aggressor:[{x:2,y:-1},{x:6,y:-3}],defensor:[{x:3,y:-1},{x:5,y:-2}],liberator:[{x:1,y:0},{x:7,y:-3}],progressor:[{x:0,y:1},{x:2,y:0},{x:4,y:-1},{x:6,y:-2},{x:8,y:-3}]},black:{intellector:[{x:4,y:4}],dominator:[{x:0,y:6},{x:8,y:2}],aggressor:[{x:2,y:5},{x:6,y:3}],defensor:[{x:3,y:4},{x:5,y:3}],liberator:[{x:1,y:5},{x:7,y:2}],progressor:[{x:0,y:5},{x:2,y:4},{x:4,y:3},{x:6,y:2},{x:8,y:1}]}}}};for(let e=0;e<9;e++)for(let t=0-Math.floor(e/2);t<7-e%2-Math.floor(e/2);t++)this.state.config.board.push({x:e,y:t});this.state.config_text=JSON.stringify(this.state.config),this.state=Object.assign(this.state,this.compile_())}onConfigTextChange(e){const t=e.target.value;this.setState({config_text:t})}insertByCoordinates(e,t,s,o,r=!0){const i=e.map((e=>t[e]));let n=s;for(let e=0;e<i.length-1;e++){const t=i[e];if(!n[t]){if(!r)return;n[t]={}}n=n[t]}const l=i[i.length-1];(n[l]||r)&&(n[l]=o)}getByCoordinates(e,t,s){const o=e.map((e=>t[e]));let r=s;for(let e=0;e<o.length-1;e++){const t=o[e];if(!r[t])return;r=r[t]}const i=o[o.length-1];return void 0!==r[i]?[r,i]:void 0}placeFiguresOnBoard(e,t,s){const o={};for(const t of s)this.insertByCoordinates(e,t,o,{});for(const s in t)for(const r in t[s])for(const i of t[s][r])this.insertByCoordinates(e,i,o,{player:s,figure:r},!1);return o}unpackBoard(e,t){return getAllElementsWithDepth(this.state.board,e.length-1).map((t=>Object.assign({},t.element,dictFromTwoLists(e,t.keys))))}compile_(){const e=JSON.parse(this.state.config_text);return{config:e,position:e.initial_position,board:this.placeFiguresOnBoard(e.cell,e.initial_position,e.board)}}compile(){JSON.parse(this.state.config_text);this.setState(this.compile_(),(()=>this.forceUpdate()))}getCellsDelta(e,t,s){const o={};for(name of e){s[name]-t[name]&&(o[name]=s[name]-t[name])}return o}isDivider(e,t,s){let o;for(let r=0;r<e.length;r++){const i=e[r];if(t[i]&&!s[i]||!t[i]&&s[i])return!1;if(void 0===t[i]||null==s[i])continue;const n=t[i]/s[i];if(n!=Math.floor(n))return!1;if(o){if(n!=o)return!1}else{if(o=n,s.also_reversed){if(Math.abs(o)>1&&!s.repeat)return!1;continue}if(o>0&&o>1&&!s.repeat)return!1;if(o<0&&(!s.also_reversed||o<-1&&!s.repeat))return!1}}return!0}matchDict(e,t){for(const s in t)if(e[s]!=t[s])return!1;return!0}canMove(e,t){const s=e.figure;if(!s)return!1;if(isObjectsEqual(e,t))return!1;const o=this.state.config.figures[s],r=e.player,i=o.movement,n=isDict(i)?i[r]:i,l=this.state.config.cell,a=this.getCellsDelta(l,e,t);for(const s of n)if(this.isDivider(l,a,s)){if(console.log("can:",s,"divides",a),!t.figure)return{actions:[]};{const r=e.player==t.player?"allied":"enemy",i=s.destination_cell_figure||o.destination_cell_figure;if(!i)return!1;{const e=i[r];if(e){const s=[];for(const o of e)this.matchDict(t,o.if)&&s.push(o.action);return 0!=s.length&&{actions:s}}}}}return!1}move(e,t,s){this.setState((o=>{const r=this.getByCoordinates(o.config.cell,e,o.board),i=this.getByCoordinates(o.config.cell,t,o.board);i[0][i[1]].figure=e.figure,i[0][i[1]].player=e.player,delete r[0][r[1]].figure,delete r[0][r[1]].player;for(const e of s)"take"==e||"swap"==e&&(r[0][r[1]].figure=t.figure,r[0][r[1]].player=t.player);return o}))}selectCell(e){if(this.state.selected_cell){const t=this.canMove(this.state.selected_cell,e);t&&this.move(this.state.selected_cell,e,t.actions),this.setState({selected_cell:void 0})}else this.setState({selected_cell:e})}render(){const e=this.unpackBoard(this.state.config.cell,this.state.board);return React.createElement("div",{className:"app"},React.createElement(Board,{board:e,selectCell:this.selectCell.bind(this),selected_cell:this.state.selected_cell}),React.createElement("div",{className:"config"},React.createElement("textarea",{className:"configText",value:JSON.stringify(this.state.config,null,"\t"),onChange:this.onConfigTextChange.bind(this)}),React.createElement("button",{className:"compileButton",onClick:this.compile.bind(this)},"compile")))}}const rootElement=document.getElementById("root");ReactDOM.render(React.createElement(Root),rootElement);