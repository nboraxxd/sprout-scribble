type SuccessResponse<Data> = {
  success: true
  message: string
  data: Data
}

type ErrorResponse = {
  success: false
  message: string
}

export type Response<Data> = SuccessResponse<Data> | ErrorResponse
