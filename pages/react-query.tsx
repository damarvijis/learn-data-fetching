import Link from "next/link"
import { useQuery } from "react-query"
import { FindProductById } from "@/http"

const ReactQuery = () => {
  const { data, status, refetch } = useQuery(["product", 1], () => FindProductById({ id: 1 }), {
    // enabled: false // <=== manual fetch
  })

  return (
    <>
      <h1>Ini product id: 1 React Query</h1>
      <Link href="/">Kembali ke Home</Link><br />
      <Link href="/about">About</Link><br /><br />

      {status === "loading" && <>Loading......</>}
      {status === "error" && <>
        Error fetching!<br />
        <button onClick={() => refetch()}>Refetch</button>
      </>
      }
      {status === "success" &&
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
            src={data.thumbnail}
          />
          <h5>{data.title}</h5>
          <p>Category: {data.category}</p>
          <p>Brand: {data.brand}</p>
          <p>Price: ${data.price}</p>
          <p>{data.description}</p>
        </div>
      }
    </>
  )
}

export default ReactQuery