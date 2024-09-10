export interface GetArticlesParamsDto {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  user_id?: number;
}
