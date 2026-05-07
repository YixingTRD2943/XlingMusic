/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import Pages from './src/entry/index';

AppRegistry.registerComponent(appName, () => Pages);
