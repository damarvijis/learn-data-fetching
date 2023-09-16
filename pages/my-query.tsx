import Link from "next/link"
import { useMyQuery2 } from "@/my-query"
import { FindProductById } from "@/http"

const MyQuery = () => {
  const query = useMyQuery2({ key: "product", fetcher: () => FindProductById({ id: 2 }) })

  return (
    <>
      <h1>Ini product id: 2 My Query</h1>
      <Link href="/">Kembali ke Home</Link><br />
      <Link href="/about">About</Link><br /><br />

      {query.status === "loading" && <>Loading......</>}
      {query.status === "error" && <>Error fetching!</>}
      {(query.status === "success" || query.status === "revalidating") &&
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <img
            style={{
              width: "80px",
              height: "100px",
            }}
            src={query.data.thumbnail}
          />
          <h5>{query.data.title}</h5>
          <p>Category: {query.data.category}</p>
          <p>Brand: {query.data.brand}</p>
          <p>Price: ${query.data.price}</p>
          <p>{query.data.description}</p>
        </div>
      }
    </>
  )
}

export default MyQuery