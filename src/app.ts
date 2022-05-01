import { readFileSync } from 'fs';
import { ParseGuide } from './parser/p4t'
import { GameGuide } from './parser/interfaces'

export interface P4TGameExport {
  foro: number,
  titulo: string,
  url: number,
  primer_post: number,
  fecha: number,
  respuestas: number,
  visitas: number,
  guia_texto: string,
  autor: string,
  es_dlc: string,
  t_encuesta: number,
  encuesta: number,
  foro_encuesta: number,
  nombre_encuesta: string,
  votos: string,
  votantes: number,
  url_encuesta: number
}


class App {
  /** Entry point of our app */
  public static run() {
    const gfile = readFileSync('examples/guias-single.json', 'utf8');
    const gjson = JSON.parse(gfile);

    let guides: P4TGameExport[];
    if (Array.isArray(gjson.guias_dlcs_p4t)) {
      guides = gjson.guias_dlcs_p4t
    } else {
      guides.push(gjson)
    }
    guides.forEach((g): GameGuide => {
      let gg = ParseGuide(g.guia_texto);
      //console.log(g.titulo)
      console.log(JSON.stringify(gg, null, 2))
      return gg
    })
  }

}

App.run();