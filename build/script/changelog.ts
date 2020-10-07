// #!/usr/bin/env node

import { sh } from 'tasksfile';
import chalk from 'chalk';

const createChangeLog = async () => {
  try {
    let cmd = `conventional-changelog -p custom-config -i CHANGELOG.md -s -r 0 `;
    // if (shell.which('git')) {
    //   cmd += '&& git add CHANGELOG.md';
    // }
    await sh(cmd, {
      async: true,
      nopipe: true,
    });

    await sh('prettier --write **/CHANGELOG.md ', {
      async: true,
      nopipe: true,
    });
    console.log(
      chalk.blue.bold('****************  ') +
        chalk.green.bold('CHANGE_LOG generated successfully！') +
        chalk.blue.bold('  ****************')
    );
  } catch (error) {
    console.log(
      chalk.blue.red('****************  ') +
        chalk.green.red('CHANGE_LOG generated error\n' + error) +
        chalk.blue.red('  ****************')
    );
    process.exit(1);
  }
};
createChangeLog();
module.exports = {
  createChangeLog,
};
