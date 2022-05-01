export interface kv {
  key: string,
  value: string
}

export const CleanBBCodeRegex = /(\[\/?justify\]|\[\/?center\]|\[\/?quote\]|\[\/?spoiler[^\]]*\])|\[\/?video\]/ig

export const BBContent = (bbid: string, text: string, ignore_miss: boolean = false): string => {
  if (text == "") { return "" }
  // bb start
  var bbidregex = new RegExp(`\\[${bbid}[\\]=]+`, "gmi")
  var bbidsp = text.search(bbidregex)
  //  console.log("%s(%d)", bbid, bbidsp)
  if (bbidsp < 0) {
    if (!ignore_miss) {
      console.warn("Unable to find %s bbcode (%s) block.", bbid, bbidregex)
    }
    return ""
  }
  return KeyValueFromBB(text, bbidsp).value || ""
}

export const KeyValueFromBB = (bb: string, sp: number): kv => {
  // keys
  var obob = bb.indexOf("[", sp);
  var obcb = bb.indexOf("]", obob);
  var key = bb.slice(obob + 1, obcb);
  //console.debug("key: %s (%d: %d/%d)", key, sp, obob, obcb)

  // value
  var cb = `[\/${key.split("=")[0]}]`
  var cbob = bb.indexOf(cb, obcb);
  var cbcb = bb.indexOf(cb, cbob) + cb.length;
  var value = bb.slice(obcb + 1, cbob)
  // .replaceAll("\r", "\n")
  //console.debug("value: %s (%s at %d/%d)", value, cb, cbob, cbcb)

  return { key: key, value: value }
}

export const BBCodeToMarkdown = (bb: string): string => {
  return bb
    .replaceAll(/\[URL="(?<url>https?:\/\/[^\s$.?#].[^\s]*)"\](?<name>.*)\[\/URL\]/igm, '[$<name>]($<url>)')
    .replaceAll(/\[URL\](?<url>https?:\/\/[^\s$.?#].[^\s]*).*\[\/URL\]/igm, '[link]($<url>)')
    .replaceAll(/\[link\]\((?<url>https?:\/\/[w]*\.?(?<platform>[^\s$.?#]+)\.[^\s]+v=(?<id>[a-zA-Z0-9-_]+)&?[^\s]+)\)/igm, '[$<platform>\/$<id>]($<url>)')
    .replaceAll(/\[video=(?<platform>[^\;]+);(?<id>[^\[]+)\](?<url>https?:\/\/[^\s$.?#].[^\s]*)\[\/video\]/igm, '[$<platform>\/$<id>]($<url>)')
    .replaceAll(/\[B\](?<sp>[\s\n]*)(?<text>[^\[]+)[\s\n]*\[\/B\]/igm, "$<sp>**$<text>**:")
    .replaceAll(/\[COLOR="(?<color>[a-zA-Z]+)"\](?<text>[^\[]+)\[\/COLOR\]/igm, "**$<text>**:")
    .replaceAll(/\[SIZE="?4"?](?<h1>[^\[]+)\[\/SIZE\]/igm, '# $<h1>')
    .replaceAll(/\[SIZE="?3"?](?<h2>[^\[]+)\[\/SIZE\]/igm, '## $<h2>')
    .replaceAll(/\[\/?list\]/igm, "\n")
    .replaceAll(CleanBBCodeRegex, "")
    .replaceAll("&#8211;", "-")
    .replaceAll("&#8220;", "\"")
    .replaceAll("&#8221;", "\"")
    .replaceAll(/\*\*(?<h>[#]+)\s/gmi, "$<h> **")
    .replaceAll("[*]", "- ")
}