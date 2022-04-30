import { kv, BBContent, KeyValueFromBB } from './bbcode'
import {
  GameGuide, TrophySummary,
  GuideInfo, GamePlanStep,
  TrophyGuide, TrophyKind
} from './interfaces'

export const ParseGuide = (bbguide: string) => {

  var gg: GameGuide = {
    game: gameName(bbguide),
    author: authorName(bbguide),
    trophySummary: trophySummary(bbguide),
    info: gameInfo(bbguide),
    intro: gameIntro(bbguide),
    plan: gamePlan(bbguide),
    trophies: gameTrophies(bbguide)
  }

  //  console.log(JSON.stringify(gg, null, 2));
  console.log(gg.trophies)
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

const gameIntro = (bb: string, sp: number = 0): string[] => {
  var keyword = "Introducción"
  var ksp = bb.indexOf(`[SIZE=\\"4\\"]${keyword}`, sp)
  return BBContent("QUOTE", bb, ksp)
    .replaceAll("[JUSTIFY]", "")
    .replaceAll("[\\\\JUSTIFY]", "")
    .split('\\n')
    .filter(l => l)
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

// TODO
const gameDLCs = (bb: string, sp: number = 0): string[] => {
  /*
  Batman Arkam
  [CENTER][B][SIZE=4]DLC's[/SIZE][/B][/CENTER]
  [QUOTE][CENTER][BOX3][URL=""][IMG]IMG[/IMG][CENTER][B][SIZE=1]NombreDLC[/SIZE][/B][/CENTER][/URL][/BOX3][/QUOTE]
  */
  return []
}

const gameTrophies = (bb: string, sp: number = 0): TrophyGuide[] => {
  var keyword = "Guía de Trofeos"
  var ksp = bb.indexOf(`[SIZE=\\"4\\"]${keyword}`, sp)
  if (ksp < 0) { return [] }

  var tlsp = bb.indexOf(`[ANAME=`, ksp)
  var tlep = bb.indexOf(`[SIZE=\\"1\\"][CENTER][B][COLOR=\\"#FF0000\\"]Aviso Legal`, ksp)
  if (tlep < 0) { tlep = bb.length }

  let gt = bb
    .substring(tlsp, tlep)
    .replaceAll("[ANAME=", "##p4t-trophy-break##[ANAME=")
    .split("##p4t-trophy-break##")
    .filter(t => t)
    .forEach((t): TrophyGuide => { return gameTrophyGuide(t) })
  return []
}

const gameTrophyGuide = (t: string): TrophyGuide => {

  //  console.log(t);

  let trophyBBCODE = rxCapture(t, /\\\/ANAME]\[(BOX[A-Z]+)[0-9]?/)

  let tg: TrophyGuide = {
    id: BBContent("ANAME", t),
    name: BBContent("B", t),
    image: BBContent("IMG", t).replaceAll("\\", ""),
    kind: gameTrophyKind(trophyBBCODE),
    difficulty: gameTrophyStars(t),
    hidden: BBContent("CENTER", t).search("oculto:") > 0,
    unobtainable: BBContent("CENTER", t).search(":imposible:") > 0,
    labels: [],
    description: BBContent("BOXBRONCE", t)
      .substring(BBContent("BOXBRONCE", t)
        .search(`\\[SIZE=3\\]\\[B\\]${BBContent("B", BBContent("BOXBRONCE", t))}\\[\\\\\\\/B\\]\\[\\\\\/SIZE\\]`))
      .replaceAll("[\\/INDENT]", "")
      .replaceAll("<br>", "\n")
      .split("\\n")
      .filter(d => d)
      .slice(1),
    guide: parseTrophyGuideBlock(BBContent(`${trophyBBCODE}2`, t))
  };

  console.log(tg)
  return tg
}

const gameTrophyKind = (btc: string): TrophyKind => {
  switch (btc) {
    case "BOXORO":
      return TrophyKind.Gold
    case "BOXPLATA":
      return TrophyKind.Silver
    case "BOXBRONCE":
      return TrophyKind.Bronze
    case "BOXBRONCE":
      return TrophyKind.Bronze
    case "BOXPLATINO":
      return TrophyKind.Platinum
  }
  console.debug("Unable to find a matching TrophyKind for BoxCode: %s", btc)
}

const gameTrophyStars = (t: string): number => {
  let starsDiff = BBContent("CENTER", t).match(/:([0-9.]+)estrellas?:/)
  if (starsDiff != null) {
    return Number(starsDiff[1]) || 0
  }
  if ((BBContent("CENTER", t).search(":imposible:")) > 0) {
    return Infinity
  }
  console.debug("Unable to parse difficulty stars: %s", t)
  return 0
}


const parseTrophyGuideBlock = (text: string): string[] => {
  switch (text) {
    case null:
      return []
    case "[Aquí explica de que manera es mas fácil conseguir dicho trofeo.]":
      return []
  }

  return text
    .replaceAll("[JUSTIFY]", "")
    .replaceAll("[\\/JUSTIFY]", "")
    .replaceAll("[spoiler]", "")
    .replaceAll("[\\/spoiler]", "")
    .replaceAll("[CENTER]", "")
    .replaceAll("[\\/CENTER]", "")
    .replaceAll("[LIST]", "")
    .replaceAll("[\\/LIST]", "")
    .replaceAll("[*]", "- ")
    .replaceAll("[B]", "**")
    .replaceAll("[/B]", "**")
    .split("\\n")
    .filter(l => l)

}
