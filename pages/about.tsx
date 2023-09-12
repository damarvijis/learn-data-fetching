import Link from "next/link"

const About = () => (
  <>
    <h1>Ini halaman About</h1>
    <Link href="/">Kembali ke Home</Link><br />
    <Link href="/react-query">React Query Product</Link><br />
    <Link href="/my-query">My Query Product</Link>
  </>
)

export default About