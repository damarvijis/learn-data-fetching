import Link from "next/link"

const Home = () => (
  <>
    <h1>Ini halaman Home</h1>
    <Link href="/about">About</Link><br />
    <Link href="/react-query">React Query Product</Link><br />
    <Link href="/my-query">My Query Product</Link>
  </>
)

export default Home