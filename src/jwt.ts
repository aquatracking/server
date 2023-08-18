import {
    SignJWT,
    jwtVerify,
    decodeJwt,
    JWTVerifyOptions,
    JWTPayload,
} from "jose";
import { getObjectTypedKeys } from "./utils/object";
import { capitalize } from "./utils/string";

type ExtractOptionName<K> = K extends `set${infer N}` ? Uncapitalize<N> : never;
export type SignOptions = Partial<{
    [K in keyof SignJWT as ExtractOptionName<K>]: Parameters<SignJWT[K]>[0];
}>;

const getEncodedKey = (rawKey: string) => {
    return new TextEncoder().encode(rawKey);
};

export const verify = (
    token: string,
    key: string,
    options?: JWTVerifyOptions
): Promise<any> => {
    return jwtVerify(token, getEncodedKey(key), options);
};

export const decode = (token: string): unknown => {
    return decodeJwt(token);
};

export const sign = (
    payload: JWTPayload,
    key: string,
    options?: SignOptions
): Promise<string> => {
    const jwtSigner = new SignJWT(payload);
    // for each option, call the corresponding SignJWT setter
    if (options) {
        for (const option of getObjectTypedKeys(options)) {
            // TODO: see if we can avoid having the `as`
            const setterKey = `set${capitalize(option)}` as const;
            if (
                !(setterKey in jwtSigner) ||
                typeof jwtSigner[setterKey] !== "function"
            ) {
                continue;
            }
            const setter = jwtSigner[setterKey] as (value: unknown) => void;
            setter(options[option]);
        }
    }
    return jwtSigner.sign(getEncodedKey(key));
};
