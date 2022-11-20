const shouldSet = ([seq, agentId], [seq2, agentId2]) =>
  seq2 > seq || (seq === seq2 && agentId > agentId2)

class Store {
  documents = {}
  versions = {}
  latestSeq = -1

  applyOps (ops) {
    // ops: [
    //   {
    //     version: [seq, agentId],
    //     id: ‘test’,
    //     fields: [0, 1, 2],
    //     values: [5, 10, ‘hello’],
    //   },
    // ]

    const filteredOps = []

    for (const op of ops) {
      const { version, id, fields, values } = op
      this.versions[id] ??= []
      this.documents[id] ??= []

      for (let i = 0; i < fields.length; i++) {
        const currentVersion = this.versions[id][fields[i]]
        if (currentVersion === undefined || shouldSet(currentVersion, version)) {
          this.versions[id][fields[i]] = version
          this.documents[id][fields[i]] = values[i]

          filteredOps.push(op)
        }
      }

      this.latestSeq = Math.max(this.latestSeq, version[0])
    }

    return filteredOps
  }
}

export default Store
