/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ApplyPlugins } from './plugins/apply';
import { FlowWithPhases } from './flow';

/**
 * Game
 *
 * Helper to generate the game move reducer. The returned
 * reducer has the following signature:
 *
 * (G, action, ctx) => {}
 *
 * You can roll your own if you like, or use any Redux
 * addon to generate such a reducer.
 *
 * The convention used in this framework is to
 * have action.type contain the name of the move, and
 * action.args contain any additional arguments as an
 * Array.
 *
 * Game({
 *   name: 'tic-tac-toe',
 *
 *   setup: (numPlayers) => {
 *     const G = {...};
 *     return G;
 *   },
 *
 *   plugins: [plugin1, plugin2, ...],
 *
 *   moves: {
 *     'moveWithoutArgs': (G, ctx) => {
 *       return Object.assign({}, G, ...);
 *     },
 *     'moveWithArgs': (G, ctx, arg0, arg1) => {
 *       return Object.assign({}, G, ...);
 *     }
 *   },
 *
 *   playerView: (G, ctx, playerID) => { ... },
 *
 *   flow: {
 *     endGameIf: (G, ctx) => { ... },
 *     endTurnIf: (G, ctx) => { ... },
 *
 *     phases: {
 *       A: { onPhaseBegin: (G, ctx) => G, onPhaseEnd: (G, ctx) => G },
 *       B: { onPhaseBegin: (G, ctx) => G, onPhaseEnd: (G, ctx) => G },
 *       ...
 *     }
 *   },
 * })
 *
 * @param {...object} setup - Function that returns the initial state of G.
 *
 * @param {...object} moves - A dictionary of move functions.
 *
 * @param {...object} playerView - A function that returns a
 *                                 derivative of G tailored for
 *                                 the specified player.
 *
 * @param {...object} flow - Customize the flow of the game (see flow.js).
 *                           Must contain the return value of Flow().
 *                           If it contains any other object, it is presumed to be a
 *                           configuration object for FlowWithPhases().
 *
 * @param {...object} seed - Seed for the PRNG.
 *
 * @param {Array} plugins - List of plugins. Each plugin is an object like the following:
 *                          {
 *                            fn: (moveFn) => {
 *                              return (G, ctx) => {
 *                                // preprocess G here
 *                                G = moveFn(G, ctx);
 *                                // postprocess G here
 *                                return G;
 *                              };
 *                            },
 *
 *                            // Optional function to modify G during setup.
 *                            setup: G => G,
 *                          }
 */
function Game({ name, setup, moves, playerView, flow, seed, plugins }) {
  if (name === undefined) name = 'default';
  if (setup === undefined) setup = () => ({});
  if (moves === undefined) moves = {};
  if (playerView === undefined) playerView = G => G;
  if (plugins === undefined) plugins = [];

  if (!flow || flow.processGameEvent === undefined) {
    flow = FlowWithPhases({ plugins, ...flow });
  }

  return {
    name,
    setup,
    playerView,
    flow,
    seed,
    plugins,
    moveNames: Object.getOwnPropertyNames(moves),
    processMove: (G, action, ctx) => {
      if (moves.hasOwnProperty(action.type)) {
        const ctxWithPlayerID = { ...ctx, playerID: action.playerID };
        const args = [G, ctxWithPlayerID].concat(action.args);
        const fn = ApplyPlugins(moves[action.type], plugins);
        return fn(...args);
      }
      return G;
    },
  };
}

export default Game;
