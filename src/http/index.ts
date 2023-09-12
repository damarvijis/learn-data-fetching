export type FindProductParamsType = {
  id: number
}

export type ProductType = {
  id: number
  title: string
  thumbnail: string
  category: string
  brand: string
  description: string
  price: number
}

export const FindProductById = async (params: FindProductParamsType): Promise<ProductType> => {
  const data = await fetch("https://dummyjson.com/products/" + params.id)
  const product = await data.json()
  return product
}