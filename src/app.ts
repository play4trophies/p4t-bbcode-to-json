import { readFileSync } from 'fs';
import { ParseGuide } from './parser/p4t'

class App {
  /** Entry point of our app */
  public static run() {
    const g = readFileSync('guia.bbcode', 'utf8');
    console.log(ParseGuide(g));
  }
}

App.run();