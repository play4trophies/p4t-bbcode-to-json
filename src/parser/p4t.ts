import { kv, BBContent, KeyValueFromBB } from './bbcode'
import { GameGuide, TrophySummary, GuideInfo, TrophyGuide, TrophyKind } from './interfaces'

export const ParseGuide = (bbguide: string) => {
  var gg: GameGuide;

  let game = gameName(bbguide);
  let author = authorName(bbguide)
  let summary = trophySummary(bbguide)
  let info = gameInfo(bbguide)

  console.debug(game);
  console.debug(author)
  console.debug(summary)
  console.debug(info)

}

const gameName = (bb: string, sp: number = 0): string => {
  var keyword = "Guía de Trofeos:"
  var ksp = bb.indexOf(`[B]${keyword}`, sp)
  var text = BBContent("B", bb, ksp)
  return text.replace(keyword, "").trim()
}

const authorName = (bb: string): string => {
  return BBContent("MENTION", bb, 0)
}

const rxCapture = (text: string, rx: RegExp): string => {
  let m = text.match(rx)
  //  console.debug(m)
  if (m == null) {
    return
  }
  return m[1]
}

const trophySummary = (bb: string, sp: number = 0): TrophySummary => {
  var keyword = ":grupotrofeos:"
  var ksp = bb.indexOf(`[B]${keyword}`, sp)
  var text = BBContent("B", bb, ksp)
  let t = Number(rxCapture(text, /:grupotrofeos:\\n([0-9]+)/));
  let p = Number(rxCapture(text, /:platino:\s([0-9]+)/));
  let g = Number(rxCapture(text, /:oro:\s([0-9]+)/));
  let s = Number(rxCapture(text, /:plata:\s([0-9]+)/));
  let b = Number(rxCapture(text, /:bronce:\s([0-9]+)/));
  if (t != (p + g + s + b)) {
    console.log("Total trophies should match the sum: %d=%d+%d+%d+%d",
      t, p, g, s, b
    )
  }
  return {
    total: t, gold: g, silver: s, bronze: b, platinum: p
  }
}

const gameInfo = (bb: string, sp: number = 0): GuideInfo => {
  var keyword = "Información General"
  var ksp = bb.indexOf(`[SIZE=\\"4\\"]${keyword}`, sp)
  var info = BBContent("LIST", bb, ksp).split('[*]')

  // initial leap of faith implementation
  if (info.length != 15) {
    console.debug(
      "Unexpected number of items in info array: got %d, want 15", info.length
    );
  }

  return {
    difficulty: rxCapture(info[1], /Dificultad.*B]\s([0-9]+).*/),
    difficultyVoteLink: rxCapture(info[1], /Dificultad.*URL=\\"(.*)\\"]Vote.*\\n/).replaceAll('\\/', '/'),
    duration: rxCapture(info[2], /Tiempo.*B]\s(.*)\\n/),
    trophiesOffline: Number(rxCapture(info[3], /Offline.*B]\s([0-9]+)\\n/)),
    trophiesOnline: Number(rxCapture(info[4], /Online.*B]\s([0-9]+)\\n/)),
    trophiesMissable: Number(rxCapture(info[5], /Perdibles.*B]\s([0-9]+)\\n/)),
    trophiesGlitched: Number(rxCapture(info[6], /Glitcheados.*B]\s([0-9]+)\\n/)),
    gameRuns: Number(rxCapture(info[7], /Partidas Mínimas.*B]\s([0-9]+)\\n/)),
    peripherals: rxCapture(info[8], /Periféricos.*B]\s(.*)\\n/).split(" "),
    onlinePeopleRequired: Number(rxCapture(info[9], /Personas Necesarias.*B]\s([0-9]+)\\n/)),
    difficultyTiedTrophies: rxCapture(info[10], /La Dificultad Afecta.*B]\s(.*)\\n/),
    cheatsAvailable: rxCapture(info[11], /Trucos Disponibles.*B]\s(.*)\\n/),
    onlineRequired: rxCapture(info[12], /Online Necesario.*B]\s(.*)\\n/),
    dlcRequired: rxCapture(info[13], /Tiene DLC.*B]\s(.*)\\n/),
    dlcPrice: rxCapture(info[13], /Tiene DLC.*B]\s(.*)\\n/),
    storePrice: rxCapture(info[14], /Precio.*B]\s(.*)/),
  }

}


const gamePlan = (bb: string, sp: number = 0): string => {
  var keyword = "Plan de Trabajo"
  var ksp = bb.indexOf(`[SIZE=\\"4\\"]${keyword}`, sp)
  var plan = BBContent("QUOTE", bb, ksp).split('[*]')
  return plan
}
