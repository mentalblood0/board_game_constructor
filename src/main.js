'use strict'

function getAllElementsWithDepth_(dict, depth, destination, keys) {
	for (const str_key of Object.keys(dict)) {
		const key = Number.parseInt(str_key, 10);
		const element = dict[key];
		const new_keys = keys.concat([key]);
		if (depth === 0)
			destination.push({
				'keys': new_keys,
				'element': element
			})
		else
			getAllElementsWithDepth_(element, depth-1, destination, new_keys);
	}
}

function getAllElementsWithDepth(dict, depth) {
	const result = [];
	getAllElementsWithDepth_(dict, depth, result, []);
	return result;
}

function dictFromTwoLists(a, b) {
	const result = {};
	for (let i = 0; i < a.length; i++)
		result[a[i]] = b[i];
	return result;
}

function matchDict(dict, conditions_dict) {
	for (const key in conditions_dict)
		if (dict[key] != conditions_dict[key])
			return false;
	return true;
}

class Root extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			'board': undefined,
			'game_state': undefined,
			'selected_cell': undefined,
			'config_text': undefined,
			'config': config
		}
		
		this.state.config_text = JSON.stringify(this.state.config);
		this.state = Object.assign(this.state, this.compile_());

		this.actions = {
			'swap': (cell_1, cell_2, board) => {
				this.setCellByCoordinates(cell_1.coordinates, Object.assign({}, cell_2), board);
				this.setCellByCoordinates(cell_2.coordinates, Object.assign({}, cell_1), board);
			},
			'move': (from_cell, to_cell, board) => {
				const from_cell_coordinates_temp = from_cell.coordinates;
				this.setCellByCoordinates(to_cell.coordinates, from_cell, board);
				this.setCellEmpty(from_cell_coordinates_temp, board);
			},
			'take': (from_cell, to_cell, board) => {
				this.setCellEmpty(to_cell.coordinates, board);
			}
		};

		this.values_computers = {
			'is_enemy': (cell, from_cell) => cell.player != from_cell.player
		};

		this.entities_getters = {
			'cell': board => this.composeUnpackedBoard(this.state.config.cell.coordinates_names, board)
		};

		this.conditions_types = {
			'exists': entities_list => Boolean(entities_list.length)
		}

		this.state_data_getters = {
			'check_win': board => {
				const current_player = this.getCurrentPlayer();
				const win_conditions = this.state.config.win_conditions[current_player];
				for (const c of win_conditions) {
					const entities = this.entities_getters[c.entity](board);
					const filtered_entities = entities.filter(e => matchDict(e, c.filter));
					const result = this.conditions_types[c.type](filtered_entities);
					return result === c.result;
				}
			}
		};

		this.game_state_passiveness_by_type = {
			'move': 'active',
			'check_win': 'passive',
			'end': 'active'
		}
	}

	componentDidMount() {
		this.startGame();
	}

	startGame() {
		this.setGameState(this.state.config.initial_game_state);
	}

	setGameState(game_state) {
		if (this.state.config.game_states[game_state])
			this.setState(state => ({'game_state': game_state}));
	}

	composeCellWithoutData(cell) {
		const cell_coords_names = this.state.config.cell.coordinates_names;
		const result = {};
		for (const name of cell_coords_names)
			result[name] = cell[name];
		return result;
	}

	getCurrentPlayer() {
		const current_state_info = this.getCurrentGameStateInfo();
		if (current_state_info)
			return current_state_info.parameters.player;
	}

	withoutCoordinates(cell) {
		const result = Object.assign({}, cell);
		delete result.coordinates;
		return result;
	}

	hangleConfigTextChange(e) {
		const new_text = e.target.value;
		this.setState({'config_text': new_text});
	}

	setCellByCoordinates(coordinates, element_to_insert, board, create_path=true) {
		const cell_coords_names = this.state.config.cell.coordinates_names;
		const coordinates_list = cell_coords_names.map(name => coordinates[name]);
		let current_level = board;
		for (let i = 0; i < coordinates_list.length - 1; i++) {
			const c = coordinates_list[i];
			if (!current_level[c]) {
				if (create_path)
					current_level[c] = {};
				else 
					return;
			}
			current_level = current_level[c];
		}
		const c = coordinates_list[coordinates_list.length - 1];
		if (!current_level[c] && !create_path)
			return;
		if (current_level[c]?.coordinates)
			current_level[c] = Object.assign({}, element_to_insert, {coordinates: current_level[c].coordinates});
		else
			current_level[c] = Object.assign({}, element_to_insert);
	}

	setCellEmpty(coordinates, board) {
		this.setCellByCoordinates(coordinates, {'coordinates': coordinates}, board);
	}

	getCellByCoordinates_(cell_coords_names, coordinates, board) {
		const coordinates_list = cell_coords_names.map(name => coordinates[name]);
		let current_level = board;
		for (let i = 0; i < coordinates_list.length - 1; i++) {
			const c = coordinates_list[i];
			if (!current_level[c])
				return undefined;
			current_level = current_level[c];
		}
		const c = coordinates_list[coordinates_list.length - 1];
		if (current_level[c] !== undefined)
			return [current_level, c];
		else
			return undefined;
	}

	getCellByCoordinates(cell_coords_names, coordinates, board) {
		const cell_address = this.getCellByCoordinates_(cell_coords_names, coordinates, board);
		return cell_address ? cell_address[0][cell_address[1]] : undefined;
	}

	composeBoardWithFigures(cell_coords_names, position, board_config) {
		const result_board = {};
		for (const cell_coordinates of board_config) {
			this.setCellEmpty(cell_coordinates, result_board);
		}
		for (const player in position) {
			for (const figure in position[player]) {
				for (const coordinates of position[player][figure]) {
					this.setCellByCoordinates(coordinates, {
						'coordinates': coordinates,
						'player': player,
						'figure': figure
					}, result_board, false);
				}
			}
		}
		return result_board;
	}

	composeUnpackedBoard(cell_coords_names, board_with_figures) {
		const keys_and_elements = getAllElementsWithDepth(this.state.board, cell_coords_names.length - 1);
		return keys_and_elements.map(k_e => k_e.element);
	}

	compile_() {
		const new_config = JSON.parse(this.state.config_text);
		return {
			'config': new_config,
			'game_state': new_config.initial_game_state,
			'position': new_config.initial_position,
			'board': this.composeBoardWithFigures(
				new_config.cell.coordinates_names,
				new_config.initial_position,
				new_config.board
			)
		};
	}

	compile() {
		const new_config = JSON.parse(this.state.config_text);
		this.setState(this.compile_());
	}

	getCoordinatesDelta(a, b) {
		const result = {};
		for (name of Object.keys(a)) {
			const d = b[name] - a[name];
			if (d)
				result[name] = b[name] - a[name];
		}
		return result;
	}

	isVectorDividedByAnother(v, divider) {
		let coefficient = undefined;
		for (const name of Object.keys(v)) {
			if ((v[name] && !divider[name]) || (!v[name] && divider[name]))
				return false;
			if ((v[name] === undefined) || (divider[name] === undefined))
				continue;
			const quotient = v[name] / divider[name];
			if (quotient != Math.floor(quotient))
				return false;
			if (coefficient) {
				if (quotient != coefficient)
					return false;
			}
			else {
				coefficient = quotient;
				if (divider.also_reversed) {
					if ((Math.abs(coefficient) > 1) && !divider.repeat)
						return false;
					continue;
				}
				if (coefficient > 0)
					if ((coefficient > 1) && !divider.repeat)
						return false;
				if (coefficient < 0)
					if (!divider.also_reversed || ((coefficient < -1) && !divider.repeat))
						return false;
			}
		}
		return {'coefficient': coefficient};
	}

	composeComputedValues(values_names, cell, from_cell) {
		const result = {};
		for (const name of values_names) {
			if (this.values_computers[name])
				result[name] = this.values_computers[name](cell, from_cell);
		}
		return result;
	}

	composeActionsForCell(cell, from_cell, figure_info, movement, cell_type) {
		const actions_by_type = movement.cell_actions || figure_info.cell_actions;
		if (!actions_by_type)
			return [];
		
		const actions = actions_by_type[cell_type];
		if (!actions)
			return [];
		
		const matched_actions = [];
		for (const a of actions) {
			if (a['if']) {
				if (a['if'].given)
					if (!matchDict(cell, a['if'].given))
						continue;
				if (a['if'].computed) {
					const computed_dict = this.composeComputedValues(Object.keys(a['if'].computed), cell, from_cell);
					if (!matchDict(computed_dict, a['if'].computed))
						continue;
					if (a.actions.includes('cancel'))
						return [];
				}
			}
			matched_actions.push({
				'target_cell': cell,
				'from_cell': from_cell,
				'actions': a.actions
			});
		}
		
		return matched_actions;
	}

	composeCellAfterSteps(cell_coords_names, from_cell, move, steps_number) {
		const result = {};
		for (const name of cell_coords_names) {
			const move_coordinate = move[name] ? move[name] : 0;
			result[name] = from_cell[name] + move_coordinate * steps_number;
		}
		return result;
	}

	composeActionsForMove(from_cell, to_cell) {
		const default_actions = [{
			'from_cell': from_cell,
			'target_cell': to_cell,
			'actions': ['move']
		}];

		const figure = from_cell.figure;
		if (!figure)
			return [];

		if (isObjectsEqual(from_cell, to_cell)) {
			return [];
		}
		
		const figure_info = this.state.config.figures[figure];
		const available_moves = figure_info.movement;
		const available_moves_for_color = isDict(available_moves) ? available_moves[from_cell.player] : available_moves;
		
		const cell_coords_names = this.state.config.cell.coordinates_names;
		const move = this.getCoordinatesDelta(from_cell.coordinates, to_cell.coordinates);

		for (const available_move of available_moves_for_color) {
			const coefficient = this.isVectorDividedByAnother(move, available_move)?.coefficient;
			if (coefficient) {
				if (to_cell.figure)  {
					const new_actions = this.composeActionsForCell(to_cell, from_cell, figure_info, available_move, 'destination');
					return new_actions;
				}
				const actions_for_transition_cells = [];
				const direction = Math.sign(coefficient);
				for (let step = direction; step != coefficient; step += direction) {
					const current_cell_coordinates = this.composeCellAfterSteps(cell_coords_names, from_cell.coordinates, available_move, step);
					const current_cell = this.getCellByCoordinates(cell_coords_names, current_cell_coordinates, this.state.board);
					if (!current_cell.figure)
						continue;
					const new_actions = this.composeActionsForCell(current_cell, from_cell, figure_info, available_move, 'transition');
					actions_for_transition_cells.push(...new_actions);
				}
				if (actions_for_transition_cells.length)
					return actions_for_transition_cells;
				return default_actions;
			}
		}
		return [];
	}

	composeStateAfterActions(state, from_cell, to_cell, actions_info) {
		for (const info of actions_info) {
			for (const a of info.actions)
			if (this.actions[a])
				this.actions[a](info.from_cell, info.target_cell, state.board);
		}
		return state;
	}

	getCurrentGameStateInfo() {
		return this.state.config.game_states[this.state.game_state];
	}

	getGameStateInfo(game_state) {
		return this.state.config.game_states[game_state];
	}

	composeNextGameState(current_state) {
		const current_state_info = this.getGameStateInfo(current_state);
		if (typeof(current_state_info.next) === 'string')
			return current_state_info.next;
		const data = this.state_data_getters[current_state_info.type](this.state.board);
		for (const branch of current_state_info.next) {
			if (matchDict({ 'result': data }, branch['if']))
				return branch.state;
		}
	}

	setNextGameState() {
		const current_state = this.state.game_state;
		let next_state = this.composeNextGameState(current_state);
		while (true) {
			const info = this.getGameStateInfo(next_state);
			const type = info.type;
			if (this.game_state_passiveness_by_type[type] != 'passive')
				break;
			next_state = this.composeNextGameState(next_state);
		}
		this.setGameState(next_state);
	}

	handleSelectCell(cell) {
		if (this.state.selected_cell) {
			const actions_for_move = this.composeActionsForMove(this.state.selected_cell, cell);
			if (actions_for_move.length > 0) {
				const new_state = this.composeStateAfterActions(this.state, this.state.selected_cell, cell, actions_for_move);
				this.setState(new_state, () => this.setNextGameState());
			}
			this.setState({'selected_cell': undefined});
		}
		else {
			const selected_cell_player = cell.player;
			if (!selected_cell_player)
				return;
			if (selected_cell_player && (selected_cell_player === this.getCurrentGameStateInfo().parameters?.player))
				this.setState({'selected_cell': cell});
		}
	}

	render() {
		const unpacked_board = this.composeUnpackedBoard(this.state.config.cell.coordinates_names, this.state.board);
		return (<div className='app'>
			<div className="gameUI">
				<Board
					board={unpacked_board}
					cell_config={this.state.config.cell}
					handleSelectCell={this.handleSelectCell.bind(this)}
					selected_cell={this.state.selected_cell}
					cell_coords_names={this.state.config.cell.coordinates_names}></Board>
				<div className="gameState unselectable">{this.state.game_state}</div>
			</div>
			<div className='config'>
				<textarea className='configText'
					value={JSON.stringify(this.state.config, null, '\t')}
					onChange={this.hangleConfigTextChange.bind(this)}></textarea>
				<button className='compileButton unselectable'
					onClick={this.compile.bind(this)}>compile</button>
			</div>
		</div>);
	}
}

const rootElement = document.getElementById('root');
ReactDOM.render(React.createElement(Root), rootElement);