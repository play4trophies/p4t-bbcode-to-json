export interface kv {
  key: string,
  value: string
}

export const BBContent = (bbid: string, bb: string, sp: number): string => {
  // bb start
  var bbidsp = bb.indexOf(`[${bbid}`, sp);
  return KeyValueFromBB(bb, bbidsp).value
}

export const KeyValueFromBB = (bb: string, sp: number): kv => {
  // key
  var obob = bb.indexOf("[", sp);
  var obcb = bb.indexOf("]", obob);
  var key = bb.slice(obob + 1, obcb);

  //console.debug("key: %s (%d: %d/%d)", key, sp, obob, obcb)

  // value
  var cb = `[\\/${key.split("=")[0]}]`
  var cbob = bb.indexOf(cb, obcb);
  var cbcb = bb.indexOf(cb, cbob) + cb.length;
  var value = bb.slice(obcb + 1, cbob)

  //console.debug("value: %s (%s at %d/%d)", value, cb, cbob, cbcb)

  return { key: key, value: value }
}