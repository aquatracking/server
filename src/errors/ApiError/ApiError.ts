export abstract class ApiError extends Error {
    statusCode: number;
    error: string;
    code: string;
    data?: unknown;

    constructor(
        statusCode: number,
        error: string,
        code: string,
        data?: unknown,
    ) {
        super();
        this.statusCode = statusCode;
        this.error = error;
        this.code = code;
        this.data = data;
    }
}
