import { kv, BBContent, KeyValueFromBB } from './bbcode'
import { GameGuide, TrophySummary, GuideInfo, TrophyGuide, TrophyKind } from './interfaces'

export const ParseGuide = (bbguide: string) => {
  var gg: GameGuide;

  let game = gameName(bbguide);
  let author = authorName(bbguide)
  let summary = trophySummary(bbguide)
  let info = gameInfo(bbguide)

  console.debug("game: %s", game);
  console.debug("author: %s", author)
  console.debug("trophysummary: %s", summary)

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

const gameInfo = (bb: string, sp: number = 0): string => {
  var keyword = "Información General"
  var ksp = bb.indexOf(`[SIZE=\\"4\\"]${keyword}`, sp)
  var info = BBContent("LIST", bb, ksp)
  info.split('[*]').forEach(i => {
    if (i.length > 0) {
      console.log(i);
    }
  })
  return
}
