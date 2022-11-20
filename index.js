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

  // const versions = {
  //   id: [[0, '123abc'], [0, '123abc'], [0, '123abc']],
  // }
  // const documents = {
  //   id: [5, 10, 'hello'],
  // }
  getSnapshotOps() {
    const ops = []

    // Per document, get all of the fields that belong to a version.
    for (const id in this.documents) {
      const versions = {}

      for (let i = 0; i < this.versions[id].length; i++) {
        const version = this.versions[id][i]
        if (version !== undefined) {
          versions[version] ??= []
          versions[version].push(i)
        }
      }

      // For each version, create an op.
      for (const version in versions) {
        const fields = versions[version]
        const values = fields.map(field => this.documents[id][field])
        ops.push({ version, id, fields, values })
      }
    }

    return ops
  }
}

export default Store
