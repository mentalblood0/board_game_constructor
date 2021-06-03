"use strict";class Root extends React.Component{constructor(e){super(e),this.state={}}componentDidMount(){window.addEventListener("resize",(()=>this.forceUpdate())),this.game=new Game(this.setState.bind(this))}render(){var e,t;if(!this.game)return null;const a=this.state.config?composeUnpackedBoard(this.state.board,this.state.config.cell.coordinates_names):void 0,n=null===(e=this.state.config)||void 0===e?void 0:e.board.rotation_angle[this.game.getCurrentPlayer()];return React.createElement("div",{className:"app",ref:this._ref},this.state.config?React.createElement("div",{className:"gameUI"},React.createElement(Board,{resources:this.state.config.resources,board:a,rotation_angle:n,cell_config:this.state.config.cell,handleSelectCell:this.game.handleSelectCell.bind(this.game),selected_cell:this.state.selected_cell,highlighted_cells:this.state.highlighted_cells||{},coordinates_names:this.state.config.cell.coordinates_names}),React.createElement("div",{className:"gameState unselectable"},this.state.current_move," ",this.state.game_state.replaceAll("_"," "))):null,React.createElement("div",{className:"config"},React.createElement("textarea",{className:"configText",value:this.state.config_text,onChange:this.game.handleConfigTextChange.bind(this.game)}),React.createElement("select",{className:"configsList",value:null===(t=this.state.config)||void 0===t?void 0:t.name,onChange:this.game.handleGameNameSelectChange.bind(this.game)},Object.keys(configs).map((e=>React.createElement("option",{key:e,value:e},e)))),React.createElement("button",{className:"uploadConfigButton unselectable",onClick:this.game.uploadConfig.bind(this.game)},"upload config"),React.createElement("button",{className:"compileButton unselectable",onClick:this.game.compile.bind(this.game)},"compile"),React.createElement("button",{className:"downloadConfigButton unselectable",onClick:this.game.downloadConfig.bind(this.game)},"download config")))}}const configs_names_available_from_server=["chess","checkers","intellector"];let configs={};function loadConfigs(){return Promise.all(configs_names_available_from_server.map((e=>fetch(`config/${e}.json`).then((e=>e.text())).then((t=>configs[e]=t)))))}const rootElement=document.getElementById("root");loadConfigs().then((()=>ReactDOM.render(React.createElement(Root),rootElement)));