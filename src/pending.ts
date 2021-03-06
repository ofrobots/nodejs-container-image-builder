// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export const pending = () => {
  // tslint:disable-next-line:no-any
  const active: {[k: string]: Promise<any>} = {};
  let inc = 0;
  return {
    // so you can Promise.all() these active promises
    active: () => {
      return Object.values(active);
    },
    track: <T>(p: Promise<T>) => {
      if (inc + 1 === inc) inc = -1;
      active[inc++] = p;
      return p.finally(() => {
        delete active[inc];
      });
    }
  } as PendingTracker;
};


export type PendingTracker = {
  // tslint:disable-next-line:no-any
  active: () => Array<Promise<any>>,
  track: <T>(p: Promise<T>) => void
};