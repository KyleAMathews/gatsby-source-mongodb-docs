import * as React from "react"
import { graphql, PageProps } from "gatsby"

const PageRoute = ({ path, data }: PageProps<Queries.TypegenPageQuery>) => {
  return (
    <main>
      <h1>title: {data.page.ast.children[0]?.children[0]?.children[0]?.value}</h1>
      <h1>Path: {path}</h1>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </main>
  )
}

export default PageRoute

export const query = graphql`
  query($id: String) {
    page(id: {eq: $id}) {
      page_id
      ast
    }
  }
`
