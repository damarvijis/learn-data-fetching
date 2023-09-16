import React, { useEffect, useReducer } from "react"
import { match } from "ts-pattern"

type DataMyQueryType = Record<string, any>

type MyQueryContextType = {
  clientData: DataMyQueryType
  setClientData: React.Dispatch<React.SetStateAction<DataMyQueryType>>
}

export const MyQueryContext = React.createContext<MyQueryContextType>({
  clientData: {},
  setClientData: (data) => data
})

export const useMyQueryContext = () => React.useContext(MyQueryContext)

type MyQueryProviderPropsType = {
  children: React.ReactNode
}

export const MyQueryProvider = ({ children }: MyQueryProviderPropsType) => {
  const [clientData, setClientData] = React.useState<DataMyQueryType>({})

  return (
    <MyQueryContext.Provider value={{ clientData, setClientData }}>
      {children}
    </MyQueryContext.Provider>
  )
}

// ================ without finite state machine ================
type UseMyQueryPropsType<DataType> = {
  key: string
  fetcher: () => Promise<DataType>
}

type UseMyQueryReturnType<DataType> = {
  status: "idle"
  data: undefined
  errorMessage: undefined
} | {
  status: "loading"
  data: undefined
  errorMessage: undefined
} | {
  status: "success"
  data: DataType
  errorMessage: undefined
} | {
  status: "error"
  data: undefined
  errorMessage: string
}

export const useMyQuery = <DataType,>({ key, fetcher }: UseMyQueryPropsType<DataType>): UseMyQueryReturnType<DataType> => {
  const { clientData, setClientData } = useMyQueryContext()
  const [result, setResult] = React.useState<UseMyQueryReturnType<DataType>>({
    data: undefined,
    errorMessage: undefined,
    status: "idle"
  }) // defaukt value check clientData dulu. kalo ada lgsg sukses

  React.useEffect(() => {
    setClientData(prevData => ({
      ...prevData,
      [key]: result.data,
    }))
  }, [key, result.data, setClientData])

  React.useEffect(() => {
    if (clientData[key] && result.status !== "success") {
      setResult({
        data: clientData[key],
        errorMessage: undefined,
        status: "success"
      })
      fetcher()
        .then((data) => {
          if (data) {
            setResult({
              data: data,
              errorMessage: undefined,
              status: "success",
            })
          }
        })
        .catch((error) => {
          setResult({
            data: undefined,
            errorMessage: "Error Fetching Data",
            status: "error",
          })
        })
    } else if (result.status === "idle") {
      setResult({
        data: undefined,
        errorMessage: undefined,
        status: "loading"
      })

      fetcher()
        .then((data) => {
          if (data) {
            setResult({
              data: data,
              errorMessage: undefined,
              status: "success",
            })
          }
        })
        .catch((error) => {
          setResult({
            data: undefined,
            errorMessage: "Error Fetching Data",
            status: "error",
          })
        })
    }
  }, [clientData, result.status, fetcher, key, setClientData])

  return result
}

// ================ with finite state machine ================
type UseQueryStateType<DataType> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "revalidating", data: DataType }
  | { status: "success", data: DataType }
  | { status: "error", errorMessage: string }

type UseQueryActionType<DataType> =
  { type: "FETCH" } |
  { type: "REFETCH" } |
  { type: "REVALIDATE", payload: { data: DataType } } |
  { type: "FETCH_SUCCESS", payload: { data: DataType } } |
  { type: "FETCH_ERROR", payload: { errorMessage: string } }

type OnStateChangeType<DataType> = {
  clientData: DataMyQueryType
  setClientData: React.Dispatch<React.SetStateAction<DataMyQueryType>>
  key: string
  fetcher: () => Promise<DataType>
  state: UseQueryStateType<DataType>
  send: (action: UseQueryActionType<DataType>) => void
}

const myQueryReducer = <DataType,>(prevState: UseQueryStateType<DataType>, action: UseQueryActionType<DataType>): UseQueryStateType<DataType> => {
  return match<[UseQueryStateType<DataType>, UseQueryActionType<DataType>], UseQueryStateType<DataType>>([prevState, action])
    .with([{ status: "idle" }, { type: "FETCH" }],
      ([state]) => ({
        ...state,
        status: "loading",
      }))
    .with([{ status: "idle" }, { type: "REVALIDATE" }],
      ([state, action]) => ({
        ...state,
        data: action.payload.data,
        status: "revalidating"
      }))
    .with([{ status: "loading" }, { type: "FETCH_SUCCESS" }],
      ([_, { payload }]) => ({
        status: "success",
        data: payload.data,
        errorMessage: undefined
      }))
    .with([{ status: "loading" }, { type: "FETCH_ERROR" }],
      ([_, { payload }]) => ({
        status: "error",
        data: undefined,
        errorMessage: payload.errorMessage
      }))
    .with([{ status: "error" }, { type: "REFETCH" }],
      ([state]) => ({
        ...state,
        status: "loading",
      }))
    .with([{ status: "revalidating" }, { type: "FETCH_SUCCESS" }],
      ([_, { payload }]) => ({
        status: "success",
        data: payload.data,
        errorMessage: undefined,
      }))
    .with([{ status: "revalidating" }, { type: "FETCH_ERROR" }],
      ([_, { payload }]) => ({
        status: "error",
        data: undefined,
        errorMessage: payload.errorMessage
      }))
    .otherwise(() => prevState)
}

const onStateChange = <DataType,>({
  state,
  fetcher,
  send,
  setClientData,
  clientData,
  key,
}: OnStateChangeType<DataType>) => {
  match(state)
    .with({ status: "idle" }, () => {
      if (clientData[key]) {
        send({ type: "REVALIDATE", payload: { data: clientData[key] } })
      } else {
        send({ type: "FETCH" })
      }
    })
    .with({ status: "loading" }, () => {
      fetcher()
        .then((data) => {
          if (data) {
            send({
              type: "FETCH_SUCCESS",
              payload: { data }
            })
          }
        })
        .catch((error) => {
          send({
            type: "FETCH_ERROR",
            payload: { errorMessage: "Error fetching data" }
          })
        })
    })
    .with({ status: "revalidating" }, () => {
      fetcher()
        .then((data) => {
          if (data) {
            send({
              type: "FETCH_SUCCESS",
              payload: { data }
            })
          }
        })
        .catch((error) => {
          send({
            type: "FETCH_ERROR",
            payload: { errorMessage: "Error fetching data" }
          })
        })
    })
    .with({ status: "success" }, (state) => {
      if (state.data !== clientData[key]) {
        setClientData(prevData => ({
          ...prevData,
          [key]: state.data,
        }))
      }
    })
    .otherwise(() => { })
}

export const useMyQuery2 = <DataType,>({ key, fetcher }: UseMyQueryPropsType<DataType>): UseQueryStateType<DataType> => {
  const { clientData, setClientData } = useMyQueryContext()
  const [state, send] = useReducer<React.Reducer<UseQueryStateType<DataType>, UseQueryActionType<DataType>>>(myQueryReducer, {
    status: "idle",
  })

  useEffect(() => {
    onStateChange({
      key,
      state,
      send,
      setClientData,
      clientData,
      fetcher
    })
  }, [state, send, setClientData, clientData, key, fetcher])

  return state
}