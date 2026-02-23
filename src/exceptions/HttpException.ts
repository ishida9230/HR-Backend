class HttpException extends Error {
  public status: number;
  public message: string;
  public details?: Record<string, unknown>;

  constructor(status: number, message: string, details?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.message = message;
    this.details = details;
  }
}

export default HttpException;
