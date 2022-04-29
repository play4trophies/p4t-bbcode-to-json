import { kv, BBContent, KeyValueFromBB } from './bbcode'
import {
  GameGuide, TrophySummary,
  GuideInfo, GamePlanStep,
  TrophyGuide, TrophyKind
} from './interfaces'

export const ParseGuide = (bbguide: string) => {
  var gg: GameGuide;

  let game = gameName(bbguide);
  let author = authorName(bbguide)
  let summary = trophySummary(bbguide)
  let info = gameInfo(bbguide)
  let plan = gamePlan(bbguide)

  console.debug(game);
  console.debug(author)
  console.debug(summary)
  console.debug(info)
  console.debug(plan)

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
  var info = BBContent("LIST", bb, ksp).split('[*][B]')

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
    trophiesOffline: Number(rxCapture(info[3], /Offline.*B]\s([0-9]+)\\n/)) || 0,
    trophiesOnline: Number(rxCapture(info[4], /Online.*B]\s([0-9]+)\\n/)) || 0,
    trophiesMissable: Number(rxCapture(info[5], /Perdibles.*B]\s([0-9]+)\\n/)) || 0,
    trophiesGlitched: Number(rxCapture(info[6], /Glitcheados.*B]\s([0-9]+)\\n/)) || 0,
    gameRuns: rxCapture(info[7], /Partidas Mínimas.*B]\s(.*)\\n/),
    peripherals: rxCapture(info[8], /Periféricos.*B]\s(.*)\\n/).split(" "),
    onlinePeopleRequired: Number(rxCapture(info[9], /Personas Necesarias.*B]\s([0-9]+)\\n/)),
    difficultyTiedTrophies: rxCapture(info[10], /La Dificultad Afecta.*B]\s(.*)\\n/),
    cheatsAvailable: rxCapture(info[11], /Trucos Disponibles.*B]\s(.*)\\n/),
    onlineRequired: rxCapture(info[12], /Online Necesario.*B]\s(.*)\\n/),
    dlcRequired: rxCapture(info[13], /Tiene DLC.*B]\s([a-zA-Z0-9,\s]+).*\\n/),
    dlcRequiredList: parseListBlock(rxCapture(info[13], /Tiene DLC.*B]\s[a-zA-Z0-9,\s]+:\[[a-zA-Z]+\](.*)\[\\\/[a-zA-Z]+\]\\n/)),
    storePrice: rxCapture(info[14], /Precio.*B]\s(.*)/).replaceAll("&#8364;", "€"),
  }

}

const parseListBlock = (text: string): string[] => {
  if (text == null) {
    return []
  }
  return text
    .replaceAll("\\n", "")
    .replaceAll("&#8364;", "€")
    .split("[*]")
    .filter(l => l)
}

const gamePlan = (bb: string, sp: number = 0): GamePlanStep[] => {
  var keyword = "Plan de Trabajo"
  var ksp = bb.indexOf(`[SIZE=\\"4\\"]${keyword}`, sp)
  return BBContent("QUOTE", bb, ksp)
    .replace("\\n", "")
    .split("[SIZE=\\\"3\\\"]")
    .filter(l => l)
    .map(
      (l): GamePlanStep => {
        var stepContent = l.split("[HR][\\\/HR]")[1]
        if (stepContent.match(/\[B\][0-9].[0-9]/) == null) {
          return {
            step: BBContent("B", l, 0),
            description: stepContent
              .replaceAll("[JUSTIFY]", "")
              .replaceAll("[\\/JUSTIFY]", "")
              .split("\\n")
              .filter(d => d),
            substeps: [],
          }
        }
        return {
          step: BBContent("B", l, 0),
          description: stepContent.split("[B]")[0].split("\\n").filter(l => l),
          substeps: stepContent
            .split("[B]")
            .filter(ss => ss)
            .map(
              (ss): GamePlanStep => {
                return {
                  step: ss.split("[\\/B]")[0],
                  description: ss.split("[\\/B]")[1].split("\\n").filter(l => l),
                  substeps: []
                }
              }
            )
        }
      }
    )
}
