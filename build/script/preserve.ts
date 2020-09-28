// 是否需要更新依赖，防止package.json更新了依赖，其他人获取代码后没有install

import path from 'path';
import fs from 'fs-extra';
import { isEqual } from 'lodash';
import chalk from 'chalk';
import { sh } from 'tasksfile';

const resolve = (dir: string) => {
  return path.resolve(process.cwd(), dir);
};

let NEED_INSTALL = false;

fs.mkdirp(resolve('build/.cache'));
function checkPkgUpdate() {
  const pkg = require('../../package.json');
  const { dependencies, devDependencies } = pkg;
  const depsFile = resolve('build/.cache/deps.json');
  if (!fs.pathExistsSync(depsFile)) {
    NEED_INSTALL = true;
    return;
  }
  const depsJson = require('../.cache/deps.json');

  if (!isEqual(depsJson, { dependencies, devDependencies })) {
    NEED_INSTALL = true;
  }
}
checkPkgUpdate();

(async () => {
  if (NEED_INSTALL) {
    console.log(
      chalk.blue.bold('****************  ') +
        chalk.red.bold('检测到依赖变化，正在安装依赖(Tip: 项目首次运行也会执行)！') +
        chalk.blue.bold('  ****************')
    );
    try {
      // 从代码执行貌似不会自动读取.npmrc 所以手动加上源地址
      // await run('yarn install --registry=https://registry.npm.taobao.org ', {
      await sh('yarn install ', {
        async: true,
        nopipe: true,
      });
      console.log(
        chalk.blue.bold('****************  ') +
          chalk.green.bold('依赖安装成功,正在运行！') +
          chalk.blue.bold('  ****************')
      );

      const pkg = require('../../package.json');
      const { dependencies, devDependencies } = pkg;
      const depsFile = resolve('build/.cache/deps.json');
      const deps = { dependencies, devDependencies };
      if (!fs.pathExistsSync(depsFile)) {
        fs.writeFileSync(depsFile, JSON.stringify(deps));
      } else {
        const depsFile = resolve('build/.cache/deps.json');
        const depsJson = require('../.cache/deps.json');
        if (!isEqual(depsJson, deps)) {
          fs.writeFileSync(depsFile, JSON.stringify(deps));
        }
      }
    } catch (error) {}
  }
})();
