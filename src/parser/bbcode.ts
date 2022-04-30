export interface kv {
  key: string,
  value: string
}

const cleanBBCodeRegex = /(\[[\\]?\/?justify\]|\[\\?\/?center\]|\[\\?\/?quote\]|\[[\\]?\/?spoiler\])/ig

export const BBContent = (bbid: string, bb: string, sp: number = 0): string => {
  // bb start
  var bbidsp = bb.indexOf(`[${bbid}]`, sp)
  if (bbidsp < 0) { bbidsp = bb.indexOf(`[${bbid}=`, sp) }
  if (bbidsp < 0) {
    console.debug("Unable to find %s bbcode block in %s.", bbid, bb)
    return null
  }
  return KeyValueFromBB(bb, bbidsp).value
}

export const KeyValueFromBB = (bb: string, sp: number): kv => {
  // key
  var obob = bb.indexOf("[", sp);
  var obcb = bb.indexOf("]", obob);
  var key = bb.slice(obob + 1, obcb);
  //console.debug("key: %s (%d: %d/%d)", key, sp, obob, obcb)

  // value
  var cb = `[\/${key.split("=")[0]}]`
  var cbob = bb.indexOf(cb, obcb);
  var cbcb = bb.indexOf(cb, cbob) + cb.length;
  var value = bb.slice(obcb + 1, cbob)
  //console.debug("value: %s (%s at %d/%d)", value, cb, cbob, cbcb)

  return { key: key, value: value }
}

export const BBCodeToMarkdown = (bb: string): string => {
  return bb
    .replaceAll(/[\\]+\//gm, "/")
    .replaceAll(/\[URL=[\\]+"(?<url>https?:\/\/[^\s$.?#].[^\s]*)\\"\](?<name>[^\[]+)\[\/URL\]/igm, '[$<name>]($<url>)')
    .replaceAll(/\[URL\](?<url>https?:\/\/[^\s$.?#].[^\s]*).*\[[\\]?\/URL\]/igm, '[link]($<url>)')
    .replaceAll(/\[\\?\/?B\]/ig, "**")
    .replaceAll(/\[COLOR=[\\]+"(?<color>[a-zA-Z]+)[\\]+"\](?<text>[^\[]+)\[\/COLOR\]/igm, "**$<text>**:")
    .replaceAll(/\[SIZE=[\\]+"4[\\]+"](?<h1>[^\[]+)\[\/SIZE\]/igm, '# $<h1>')
    .replaceAll(/\[SIZE=[\\]+"3[\\]+"](?<h2>[^\[]+)\[\/SIZE\]/igm, '## $<h2>')
    .replaceAll(/\[[\\]?\/?list\]/igm, "\\n")
    .replaceAll(cleanBBCodeRegex, "")
    .replaceAll("&#8211;", "-")
    .replaceAll("&#8220;", "\"")
    .replaceAll("&#8221;", "\"")
    .replaceAll(/\*\*(?<h>[#]+)\s/gmi, "$<h> **")
    .replaceAll("[*]", "- ")
}