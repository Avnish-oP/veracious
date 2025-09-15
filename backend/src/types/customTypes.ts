interface Response<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
export type { Response };
