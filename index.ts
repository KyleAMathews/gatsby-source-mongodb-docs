import fs from "fs"
import bson from "bson"

const fileContent = fs.readFileSync(`/Users/kylemathews/Downloads/manual-master/documents/crud.bson`)
console.log(bson.deserialize(fileContent).ast.options.headings)


