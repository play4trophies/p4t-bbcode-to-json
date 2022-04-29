import { readFileSync } from 'fs';
import { ParseGuide } from './parser/p4t'

class App {
  /** Entry point of our app */
  public static run() {
    const ga = readFileSync('guia-a.bbcode', 'utf8');
    ParseGuide(ga);
    const gb = readFileSync('guia-b.bbcode', 'utf8');
    ParseGuide(gb);
  }
}

App.run();