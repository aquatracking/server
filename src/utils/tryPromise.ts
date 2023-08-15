export type TryPromise<Result> =
    | { success: true; error: undefined; result: Result }
    | { success: false; error: unknown; result: undefined };
export const tryPromise = async <Result>(
    promise: Promise<Result>
): Promise<TryPromise<Result>> => {
    try {
        return { success: true, result: await promise, error: undefined };
    } catch (error) {
        return { success: false, error, result: undefined };
    }
};
