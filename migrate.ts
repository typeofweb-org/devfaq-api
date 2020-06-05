#!/usr/bin/env ts-node-script

import { Sequelize } from 'sequelize';
// tslint:disable-next-line: no-implicit-dependencies
import { Umzug, SequelizeStorage, Migration } from 'umzug';
import { sequelizeConfig } from './src/db';
import Path from 'path';

const sequelize = new Sequelize({ ...sequelizeConfig, logging: undefined });

const umzug = new Umzug({
  logging: console.info,
  migrations: {
    path: './src/migrations',
    pattern: /\.ts$/,
    params: [sequelize.getQueryInterface(), Sequelize],
    nameFormatter(path) {
      // ignore file extension to make it compatible with older .js migrations
      return Path.basename(path).replace(Path.extname(path), '');
    },
  },
  storage: new SequelizeStorage({ sequelize }),
});

const execute = async (fn: () => Promise<Migration[]>, msg: string) => {
  fn()
    .then((result) => {
      console.log(
        msg,
        result.map((r) => r?.file ?? r)
      );
      process.exit();
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
};

export const up = () => execute(() => umzug.up(), 'Executed migrations:');
export const down = () => execute(() => umzug.down(), 'Reverted migration:');
