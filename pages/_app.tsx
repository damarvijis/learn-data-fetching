import type { AppProps } from "next/app";
import Head from "next/head";
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query'
import {
  MyQueryProvider
} from "@/my-query";

export default function App({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient()

  return (
    <>
      <Head>
        <title>Learn State Management</title>
        <meta name="description" content="Learn State Management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <MyQueryProvider>
          <Component {...pageProps} />
        </MyQueryProvider>
      </QueryClientProvider>
    </>
  );
}
