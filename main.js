"use strict";function getAllElementsWithDepth_(t,e,s,o){for(const i of Object.keys(t)){const n=Number.parseInt(i,10),c=t[n],r=o.concat([n]);0==e?s.push({keys:r,element:c}):getAllElementsWithDepth_(c,e-1,s,r)}}function getAllElementsWithDepth(t,e){const s=[];return getAllElementsWithDepth_(t,e,s,[]),s}function dictFromTwoLists(t,e){const s={};for(let o=0;o<t.length;o++)s[t[o]]=e[o];return s}class Root extends React.Component{constructor(t){super(t),this.state={board:void 0,selected_cell:void 0,config_text:void 0,config:default_config};for(let t=0;t<9;t++)for(let e=0-Math.floor(t/2);e<7-t%2-Math.floor(t/2);e++)this.state.config.board.push({x:t,y:e});this.state.config_text=JSON.stringify(this.state.config),this.state=Object.assign(this.state,this.compile_()),this.actions={swap:(t,e,s)=>{this.setByCoordinates(t,e,s),this.setByCoordinates(e,t,s)},move:(t,e,s)=>{this.setByCoordinates(e,this.withoutCoordinates(t),s),this.emptyCell(t,s)},take:(t,e,s)=>{this.setByCoordinates(e,this.withoutCoordinates(t),s),this.emptyCell(t,s)}},this.values_computers={is_enemy:(t,e)=>t.player!=e.player}}withoutData(t){const e=this.state.config.cell,s={};for(const o of e)s[o]=t[o];return s}withoutCoordinates(t){const e=Object.assign({},t),s=this.state.config.cell;for(const t of s)delete e[t];return e}onConfigTextChange(t){const e=t.target.value;this.setState({config_text:e})}setByCoordinates(t,e,s,o=!0){const i=this.state.config.cell.map((e=>t[e]));let n=s;for(let t=0;t<i.length-1;t++){const e=i[t];if(!n[e]){if(!o)return;n[e]={}}n=n[e]}const c=i[i.length-1];(n[c]||o)&&(n[c]=e)}emptyCell(t,e){this.setByCoordinates(t,this.withoutData(t),e)}getByCoordinates_(t,e,s){const o=t.map((t=>e[t]));let i=s;for(let t=0;t<o.length-1;t++){const e=o[t];if(!i[e])return;i=i[e]}const n=o[o.length-1];return void 0!==i[n]?[i,n]:void 0}getByCoordinates(t,e,s){const o=this.getByCoordinates_(t,e,s);return o?o[0][o[1]]:void 0}placeFiguresOnBoard(t,e,s){const o={};for(const t of s)this.emptyCell(t,o);for(const t in e)for(const s in e[t])for(const i of e[t][s])this.setByCoordinates(i,{player:t,figure:s},o,!1);return o}unpackBoard(t,e){return getAllElementsWithDepth(this.state.board,t.length-1).map((e=>Object.assign(e.element,dictFromTwoLists(t,e.keys))))}compile_(){const t=JSON.parse(this.state.config_text);return{config:t,position:t.initial_position,board:this.placeFiguresOnBoard(t.cell,t.initial_position,t.board)}}compile(){JSON.parse(this.state.config_text);this.setState(this.compile_(),(()=>this.forceUpdate()))}getCellsDelta(t,e,s){const o={};for(name of t){s[name]-e[name]&&(o[name]=s[name]-e[name])}return o}isDivider(t,e,s){let o;for(let i=0;i<t.length;i++){const n=t[i];if(e[n]&&!s[n]||!e[n]&&s[n])return!1;if(void 0===e[n]||null==s[n])continue;const c=e[n]/s[n];if(c!=Math.floor(c))return!1;if(o){if(c!=o)return!1}else{if(o=c,s.also_reversed){if(Math.abs(o)>1&&!s.repeat)return!1;continue}if(o>0&&o>1&&!s.repeat)return!1;if(o<0&&(!s.also_reversed||o<-1&&!s.repeat))return!1}}return{coefficient:o}}matchDict(t,e){for(const s in e)if(t[s]!=e[s])return!1;return!0}computeValues(t,e,s){const o={};for(const i of t)this.values_computers[i]&&(o[i]=this.values_computers[i](e,s));return o}getActionsForCell(t,e,s,o,i){const n=o.cell_actions||s.cell_actions;if(!n)return!1;const c=n[i];if(!c)return!1;const r=[];for(const s of c){if(s.if){if(s.if.given&&!this.matchDict(t,s.if.given))continue;if(s.if.computed){const o=this.computeValues(Object.keys(s.if.computed),t,e);if(!this.matchDict(o,s.if.computed))continue}}r.push(s.action)}return 0!=r.length&&(!r.includes("cancel")&&{actions:r})}getCellAfterSteps(t,e,s,o){const i={};for(const n of t){const t=s[n]?s[n]:0;i[n]=e[n]+t*o}return i}canMove(t,e){console.log("canMove",t,e);const s=t.figure;if(!s)return!1;if(isObjectsEqual(t,e))return!1;const o=this.state.config.figures[s],i=o.movement,n=isDict(i)?i[t.player]:i,c=this.state.config.cell,r=this.getCellsDelta(c,t,e);for(const s of n){var l;const i=null===(l=this.isDivider(c,r,s))||void 0===l?void 0:l.coefficient;if(i){if(e.figure)return this.getActionsForCell(e,t,o,s,"destination");const n=[],r=Math.sign(i);for(let e=r;e!=i;e+=r){const i=this.getCellAfterSteps(c,t,s,e),r=this.getByCoordinates(c,i,this.state.board);if(!r.figure)continue;const l=this.getActionsForCell(r,t,o,s,"transition");if(!1===l)return!1;n.push(...l)}return n.length?{actions:n}:{actions:["move"]}}}return!1}makeActions(t,e,s){this.setState((o=>{for(const i of s)this.actions[i]&&this.actions[i](t,e,o.board);return o}))}selectCell(t){if(this.state.selected_cell){const e=this.canMove(this.state.selected_cell,t);e&&this.makeActions(this.state.selected_cell,t,e.actions),this.setState({selected_cell:void 0})}else this.setState({selected_cell:t})}render(){const t=this.unpackBoard(this.state.config.cell,this.state.board);return React.createElement("div",{className:"app"},React.createElement(Board,{board:t,selectCell:this.selectCell.bind(this),selected_cell:this.state.selected_cell,cell_coords_names:this.state.config.cell}),React.createElement("div",{className:"config"},React.createElement("textarea",{className:"configText",value:JSON.stringify(this.state.config,null,"\t"),onChange:this.onConfigTextChange.bind(this)}),React.createElement("button",{className:"compileButton",onClick:this.compile.bind(this)},"compile")))}}const rootElement=document.getElementById("root");ReactDOM.render(React.createElement(Root),rootElement);