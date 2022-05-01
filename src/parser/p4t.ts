import { BBContent, BBCodeToMarkdown, CleanBBCodeRegex } from './bbcode'
import {
  GameGuide, TrophySummary,
  GuideInfo, GamePlanStep,
  TrophyGuide, TrophyKind
} from './interfaces'

export const ParseGuide = (p4t_guide: string): GameGuide => {

  if (p4t_guide == undefined || p4t_guide == undefined) {
    console.log("Guide text is empty")
    return null
  }

  var gg: GameGuide = {
    game: gameName(p4t_guide),
    author: authorName(p4t_guide),
    trophySummary: trophySummary(p4t_guide),
    info: gameInfo(p4t_guide),
    intro: gameIntro(p4t_guide),
    plan: gamePlan(p4t_guide),
    trophies: gameTrophies(p4t_guide)
  }

  //console.log(JSON.stringify(gg, null, 2));
  return gg
}

const gameName = (bb: string, sp: number = 0): string => {
  var keyword = "Guía de Trofeos:"
  var ksp = bb.indexOf(`[B]${keyword}`, sp)
  var text = BBContent("B", bb.slice(ksp))
  return text.replace(keyword, "").trim()
}

const authorName = (bb: string): string => {
  let author = BBContent("MENTION", bb, true)
  if (author != "") { return author }

  var keyword = "Redactada por"
  var ksp = bb.indexOf(keyword)
  var author_content = BBContent("B", bb.slice(ksp), true)
  author = rxCapture(author_content, /member\.php.*>(.*)<\/a>/)
    .replaceAll(CleanBBCodeRegex, "")
    .trim()

  if (author != "") { return author }

  author = BBContent("URL", author_content, true)
    .replaceAll(CleanBBCodeRegex, "")
    .trim()
  if (author != "") { return author }

  if (author_content != "") {
    return author_content
      .replaceAll(CleanBBCodeRegex, "")
      .replaceAll(/\[\/?[^\]]+\]/g, "")
      .trim()
  }

  console.log("Unable to locate author information: %s", author_content)
  return null
}

const rxCapture = (text: string, rx: RegExp): string => {
  if (text == null) { return null }
  let m = text.match(rx)
  if (m == null) { return "" }
  return m[1]
}

const trophySummary = (bb: string, sp: number = 0): TrophySummary => {
  var keyword = ":grupotrofeos:"
  var ksp = bb.indexOf(`[B]${keyword}`, sp)
  var text = BBContent("B", bb.slice(ksp))

  let t = Number(rxCapture(text, /:grupotrofeos:[\n\s]*([0-9]+)/m));
  let p = Number(rxCapture(text, /:platino:\s([0-9]+)/m));
  let g = Number(rxCapture(text, /:oro:\s([0-9]+)/m));
  let s = Number(rxCapture(text, /:plata:\s([0-9]+)/m));
  let b = Number(rxCapture(text, /:bronce:\s([0-9]+)/m));
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

  let ksp = bb.slice(sp).search(/\[SIZE=\"?4\"?\]Introducción/)

  // Look for the image if text based search fails
  if (ksp < 0) { ksp = bb.indexOf("[IMG]http://i.imgur.com/hBslYnn.png[/IMG]", sp) }

  if (ksp < 0) {
    //console.log("%d: %s", ksp, bb.slice(sp).replaceAll("\n", "").substring(0, 4096))
    console.warn('Unable to locate the game introduction section.',)
    return
  }

  return BBCodeToMarkdown(BBContent("QUOTE", bb.slice(ksp)))
    .split('\n')
    .filter(l => l)
}

const gameInfo = (bb: string, sp: number = 0): GuideInfo => {

  let ksp = bb.slice(sp).search(/\[SIZE=\"?4\"?\]Información General/)

  // Look for the image if text based search fails
  if (ksp < 0) { ksp = bb.indexOf("[IMG]http://i.imgur.com/dCSjmjy.png[/IMG]", sp) }

  if (ksp < 0) {
    //console.log("%d: %s", ksp, bb.slice(sp).replaceAll("\n", "").substring(0, 4096))
    console.warn('Unable to locate the game info section.')
    return
  }

  var info = BBContent("LIST", bb.slice(ksp)).split('[*][B]').filter(i => i)

  return {
    difficulty: (info.length > 0) ? rxCapture(info[0], /Dificultad.*B]\s([0-9]+).*/) : null,
    difficultyVoteLink: (info.length > 0) ? rxCapture(info[0], /Dificultad.*URL="(.*)"]Vote.*\n/) : null,
    duration: (info.length > 1) ? rxCapture(info[1], /Tiempo.*B]\s(.*)\n/) : null,
    trophiesOffline: (info.length > 2) ? Number(rxCapture(info[2], /Offline.*B]\s([0-9]+)\n/) || 0) : 0,
    trophiesOnline: (info.length > 3) ? Number(rxCapture(info[3], /Online.*B]\s([0-9]+)\n/) || 0) : 0,
    trophiesMissable: (info.length > 4) ? Number(rxCapture(info[4], /Perdibles.*B]\s([0-9]+)\n/) || 0) : 0,
    trophiesGlitched: (info.length > 5) ? Number(rxCapture(info[5], /Glitcheados.*B]\s([0-9]+)\n/) || 0) : 0,
    gameRuns: (info.length > 6) ? rxCapture(info[6], /Partida.*B]\s(.*)\n/) : null,
    peripherals: (info.length > 7) ? rxCapture(info[7], /Periféricos.*B]\s(.*)\n/).split(" ") : [],
    onlinePeopleRequired: (info.length > 8) ? Number(rxCapture(info[8], /Personas Necesarias.*B]\s([0-9]+)\n/) || 0) : 0,
    difficultyTiedTrophies: (info.length > 9) ? rxCapture(info[9], /La Dificultad Afecta.*B]\s(.*)\n/) : null,
    cheatsAvailable: (info.length > 10) ? rxCapture(info[10], /Trucos Disponibles.*B]\s(.*)\n/) : null,
    onlineRequired: (info.length > 11) ? rxCapture(info[11], /Online Necesario.*B]\s(.*)\n/) : null,
    dlcRequired: (info.length > 12) ? rxCapture(info[12], /Tiene DLC.*B]\s([a-zA-Z0-9,\s]+).*\n/) : "No",
    dlcRequiredList: (info.length > 12) ? parseListBlock(rxCapture(info[12], /Tiene DLC.*B]\s[a-zA-Z0-9,\s]+:\[[a-zA-Z]+\](.*)\[\/[a-zA-Z]+\]\n/)) : [],
    storePrice: (info.length > 13) ? rxCapture(info[13], /Precio.*B]\s(.*)/).replaceAll("&#8364;", "€") : null,
  }

}

const parseListBlock = (text: string): string[] => {
  if (text == null) {
    return []
  }
  return text
    .replaceAll("\n", "")
    .replaceAll("&#8364;", "€")
    .split("[*]")
    .filter(l => l)
}

const gamePlan = (bb: string, sp: number = 0): GamePlanStep[] => {

  let ksp = bb.slice(sp).search(/\[SIZE=\"?4\"?\]Plan de Trabajo/)

  // Look for the image if text based search fails
  if (ksp < 0) { ksp = bb.indexOf("[IMG]http://i.imgur.com/OdFbBsq.png[/IMG]", sp) }

  if (ksp < 0) {
    //console.log("%d: %s", ksp, bb.slice(sp).replaceAll("\n", "").substring(0, 4096))
    console.warn('Unable to locate the game plan section.',)
    return
  }

  return BBContent("QUOTE", bb.slice(ksp))
    .replace("\n", "")
    .split(/\[SIZE="?3"?/igm)
    .filter(l => l)
    .map(
      (l): GamePlanStep => {
        var stepContent = l.split("[HR][/HR]")[1]
        if (stepContent.match(/\[B\][0-9].[0-9]/) == null) {
          return {
            step: BBContent("B", l),
            description: BBCodeToMarkdown(stepContent)
              .split("\n")
              .filter(d => d),
            substeps: [],
          }
        }
        return {
          step: BBContent("B", l),
          description: stepContent.split("[B]")[0].split("\n").filter(l => l),
          substeps: stepContent
            .split("[B]")
            .filter(ss => ss)
            .map(
              (ss): GamePlanStep => {
                return {
                  step: ss.split("[/B]")[0],
                  description: ss.split("[/B]")[1].split("\n").filter(l => l),
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
  var ksp = bb.indexOf(`[SIZE="4"]${keyword}`, sp)
  if (ksp < 0) { return [] }

  var tlsp = bb.indexOf(`[ANAME=`, ksp)
  var tlep = bb.indexOf(`[SIZE="1"][CENTER][B][COLOR="#FF0000"]Aviso Legal`, ksp)
  if (tlep < 0) { tlep = bb.length }

  return bb
    .substring(tlsp, tlep)
    .replaceAll("[ANAME=", "##p4t-trophy-break##[ANAME=")
    .split("##p4t-trophy-break##")
    .filter(t => t)
    .map((t): TrophyGuide => { return gameTrophyGuide(t) })
}

const gameTrophyGuide = (t: string): TrophyGuide => {

  let trophyBBCODE = rxCapture(t, /\/ANAME]\[(BOX[A-Z]+)[0-9]?/)

  let tg: TrophyGuide = {
    id: BBContent("ANAME", t),
    name: BBContent("B", t),
    image: BBContent("IMG", t).replaceAll("", ""),
    kind: gameTrophyKind(trophyBBCODE),
    difficulty: gameTrophyStars(t),
    hidden: BBContent("CENTER", t).search("oculto:") > 0,
    unobtainable: BBContent("CENTER", t).search(":imposible:") > 0,
    labels: gameTrophyLabels(BBContent("INDENT", t)),
    description: gameTrophyDescription(BBContent(trophyBBCODE, t)),
    guide: parseTrophyGuideBlock(
      BBContent(`${trophyBBCODE}2`, t, (trophyBBCODE == 'BOXPLATINO'))
    )
  };

  return tg
}

const gameTrophyDescription = (t: string): string[] => {
  return t
    .substring(t
      .indexOf(`[SIZE=3][B]${BBContent("B", t)}[/B][/SIZE]`))
    .replaceAll("[/INDENT]", "")
    .replaceAll("<br>", "\n")
    .split("\n")
    .filter(d => d)
    .slice(1)
}

const gameTrophyKind = (btc: string): TrophyKind => {
  switch (btc) {
    case "BOXORO":
      return TrophyKind.Gold
    case "BOXPLATA":
      return TrophyKind.Silver
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


const parseTrophyGuideBlock = (tblock: string): string[] => {
  switch (tblock) {
    case null:
      return []
    case undefined:
      return []
    case "[Aquí explica de que manera es mas fácil conseguir dicho trofeo.]":
      return []
  }
  return BBCodeToMarkdown(tblock)
    .split("\n")
    .filter(l => l)
}

const gameTrophyLabels = (t: string): string[] => {
  return t
    .substring(
      t.indexOf("&#9675;") + "&#9675;".length,
      t.indexOf("\n[SIZE=3]")
    )
    .replaceAll(":psn: o :ds2:", ":psn_or_ds2:")
    .replaceAll(":", "\n")
    .split("\n")
    .filter(lt => lt)
}