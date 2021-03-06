/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import PluginImmer from './plugin-immer';

/**
 * Applies the provided plugins to the given move function.
 * PluginImmer is always added.
 */
export const ApplyPlugins = (fn, plugins) => {
  const reducer = (acc, { fn }) => fn(acc);
  return [PluginImmer, ...plugins].reduce(reducer, fn);
};
