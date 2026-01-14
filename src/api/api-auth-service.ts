/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface AccountInsertCommand {
  /**
   * @format email
   * @minLength 0
   * @maxLength 255
   * @default "edusmartAI@gmail.com"
   */
  email: string;
  /**
   * @minLength 6
   * @maxLength 100
   * @default "Edusmart@123"
   */
  password: string;
  /**
   * @minLength 2
   * @maxLength 50
   * @default "Edu"
   * @pattern ^[\p{L}\s]+$
   */
  firstName: string;
  /**
   * @minLength 2
   * @maxLength 50
   * @default "Smart"
   * @pattern ^[\p{L}\s]+$
   */
  lastName: string;
}

export interface AccountInsertResponse {
  success?: boolean;
  messageId?: string;
  message?: string;
  detailErrors?: DetailError[];
  response?: string;
}

export interface AccountVerifyCommand {
  /** @minLength 1 */
  key: string;
}

export interface AccountVerifyResponse {
  success?: boolean;
  messageId?: string;
  message?: string;
  detailErrors?: DetailError[];
  response?: string;
}

export interface DetailError {
  field?: string;
  messageId?: string;
  errorMessage?: string;
}

export interface ForgotPasswordCommand {
  /** @minLength 1 */
  email: string;
}

export interface ForgotPasswordResponse {
  success?: boolean;
  messageId?: string;
  message?: string;
  detailErrors?: DetailError[];
  response?: string;
}

export interface ResetPasswordCommand {
  /** @minLength 1 */
  key: string;
  /**
   * @minLength 6
   * @maxLength 100
   */
  newPassword: string;
}

export interface ResetPasswordResponse {
  success?: boolean;
  messageId?: string;
  message?: string;
  detailErrors?: DetailError[];
  response?: string;
}

export interface TokenVerifyResponse {
  success?: boolean;
  messageId?: string;
  message?: string;
  detailErrors?: DetailError[];
  response?: TokenVerifyResponseEntity;
}

export interface TokenVerifyResponseEntity {
  /** @format uuid */
  userId?: string;
  name?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
}

export interface UpdatePasswordCommand {
  /** @minLength 1 */
  currentPassword: string;
  /**
   * @minLength 6
   * @maxLength 100
   */
  newPassword: string;
  /** @minLength 1 */
  confirmPassword: string;
}

export interface UpdatePasswordResponse {
  success?: boolean;
  messageId?: string;
  message?: string;
  detailErrors?: DetailError[];
  response?: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "/auth";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Auth Service
 * @version v1
 * @baseUrl /auth
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Account
     * @name V1AccountForgotPasswordCreate
     * @request POST:/api/v1/Account/forgot-password
     * @secure
     */
    v1AccountForgotPasswordCreate: (
      body: ForgotPasswordCommand,
      params: RequestParams = {},
    ) =>
      this.request<ForgotPasswordResponse, any>({
        path: `/api/v1/Account/forgot-password`,
        method: "POST",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Account
     * @name V1AccountInsertAccountCreate
     * @request POST:/api/v1/Account/insert-account
     * @secure
     */
    v1AccountInsertAccountCreate: (
      body: AccountInsertCommand,
      params: RequestParams = {},
    ) =>
      this.request<AccountInsertResponse, any>({
        path: `/api/v1/Account/insert-account`,
        method: "POST",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Account
     * @name V1AccountResetPasswordCreate
     * @request POST:/api/v1/Account/reset-password
     * @secure
     */
    v1AccountResetPasswordCreate: (
      body: ResetPasswordCommand,
      params: RequestParams = {},
    ) =>
      this.request<ResetPasswordResponse, any>({
        path: `/api/v1/Account/reset-password`,
        method: "POST",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Account
     * @name V1AccountUpdatePasswordCreate
     * @request POST:/api/v1/Account/update-password
     * @secure
     */
    v1AccountUpdatePasswordCreate: (
      body: UpdatePasswordCommand,
      params: RequestParams = {},
    ) =>
      this.request<UpdatePasswordResponse, any>({
        path: `/api/v1/Account/update-password`,
        method: "POST",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Account
     * @name V1AccountVerifyAccountCreate
     * @request POST:/api/v1/Account/verify-account
     * @secure
     */
    v1AccountVerifyAccountCreate: (
      body: AccountVerifyCommand,
      params: RequestParams = {},
    ) =>
      this.request<AccountVerifyResponse, any>({
        path: `/api/v1/Account/verify-account`,
        method: "POST",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  connect = {
    /**
     * No description
     *
     * @tags Auth
     * @name LogoutCreate
     * @request POST:/connect/logout
     * @secure
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/connect/logout`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name TokenCreate
     * @request POST:/connect/token
     * @secure
     */
    tokenCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/connect/token`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
  verifyToken = {
    /**
     * No description
     *
     * @tags Auth
     * @name VerifyTokenCreate
     * @request POST:/verify-token
     * @secure
     */
    verifyTokenCreate: (params: RequestParams = {}) =>
      this.request<TokenVerifyResponse, any>({
        path: `/verify-token`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
