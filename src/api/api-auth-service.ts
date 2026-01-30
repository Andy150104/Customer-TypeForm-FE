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

export enum LogicCondition {
  Is = "Is",
  IsNot = "IsNot",
  Contains = "Contains",
  DoesNotContain = "DoesNotContain",
  GreaterThan = "GreaterThan",
  LessThan = "LessThan",
  GreaterThanOrEqual = "GreaterThanOrEqual",
  LessThanOrEqual = "LessThanOrEqual",
  Always = "Always",
}

/** @format int32 */
export enum FieldType {
  Value0 = 0,
  Value1 = 1,
  Value2 = 2,
  Value3 = 3,
  Value4 = 4,
  Value5 = 5,
  Value6 = 6,
  Value7 = 7,
  Value8 = 8,
  Value9 = 9,
  Value10 = 10,
  Value11 = 11,
  Value12 = 12,
  Value13 = 13,
  Value14 = 14,
  Value15 = 15,
}

export interface AnswerDetailResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  fieldId?: string;
  fieldTitle?: string | null;
  fieldDescription?: string | null;
  fieldType?: string | null;
  value?: any;
  /** @format uuid */
  fieldOptionId?: string | null;
  optionLabel?: string | null;
  optionValue?: string | null;
  /** @format date-time */
  createdAt?: string;
}

export interface AnswerDto {
  /** @format uuid */
  fieldId?: string;
  value?: any;
  /** @format uuid */
  fieldOptionId?: string | null;
}

export interface AnswerResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  fieldId?: string;
  fieldTitle?: string | null;
  fieldType?: string | null;
  value?: any;
  /** @format uuid */
  fieldOptionId?: string | null;
  optionLabel?: string | null;
  optionValue?: string | null;
  /** @format date-time */
  createdAt?: string;
}

export interface CreateFieldCommand {
  /** @format uuid */
  formId?: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  type?: FieldType;
  properties?: any;
  isRequired?: boolean;
  options?: FieldOptionDto[] | null;
}

export interface CreateFieldCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: CreateFieldResponseEntity;
}

export interface CreateFieldResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  formId?: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  type?: string | null;
  properties?: any;
  isRequired?: boolean;
  /** @format int32 */
  order?: number;
  /** @format date-time */
  createdAt?: string;
  options?: FieldOptionResponseEntity[] | null;
}

export interface CreateFormCommand {
  title?: string | null;
}

export interface CreateFormCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: CreateFormResponseEntity;
}

export interface CreateFormFromTemplateCommand {
  /** @format uuid */
  templateId?: string;
  title?: string | null;
}

export interface CreateFormFromTemplateCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: CreateFormFromTemplateResponseEntity;
}

export interface CreateFormFromTemplateResponseEntity {
  /** @format uuid */
  formId?: string;
  /** @format uuid */
  templateId?: string;
  title?: string | null;
  slug?: string | null;
  isPublished?: boolean;
  /** @format int32 */
  fieldCount?: number;
  /** @format date-time */
  createdAt?: string;
}

export interface CreateFormResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  userId?: string;
  title?: string | null;
  slug?: string | null;
  isPublished?: boolean;
  /** @format date-time */
  createdAt?: string;
}

export interface CreateMultipleFieldCommand {
  /** @format uuid */
  formId?: string;
  fields?: FieldDataDto[] | null;
}

export interface CreateMultipleFieldCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: CreateFieldResponseEntity[] | null;
}

export interface CreateOrUpdateLogicCommand {
  /** @format uuid */
  fieldId?: string;
  condition?: LogicCondition;
  value?: string | null;
  /** @format uuid */
  destinationFieldId?: string | null;
}

export interface CreateOrUpdateLogicCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: LogicResponseEntity;
}

export interface CreateTemplateCommand {
  title?: string | null;
  description?: string | null;
  themeConfig?: any;
  settings?: any;
  fields?: TemplateFieldDataDto[] | null;
}

export interface CreateTemplateCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: CreateTemplateResponseEntity;
}

export interface CreateTemplateResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  userId?: string;
  title?: string | null;
  description?: string | null;
  /** @format int32 */
  fieldCount?: number;
  /** @format date-time */
  createdAt?: string;
}

export interface DeleteFieldCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: DeleteFieldResponseEntity;
}

export interface DeleteFieldResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format date-time */
  updatedAt?: string;
}

export interface DeleteFormCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: DeleteFormResponseEntity;
}

export interface DeleteFormResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format date-time */
  updatedAt?: string;
}

export interface DeleteLogicCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: DeleteLogicResponseEntity;
}

export interface DeleteLogicResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format date-time */
  updatedAt?: string;
}

export interface DeleteTemplateCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: DeleteTemplateResponseEntity;
}

export interface DeleteTemplateResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format date-time */
  updatedAt?: string;
}

export interface DetailError {
  field?: string | null;
  messageId?: string | null;
  errorMessage?: string | null;
}

export interface FieldDataDto {
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  type?: FieldType;
  properties?: any;
  isRequired?: boolean;
  options?: FieldOptionDto[] | null;
}

export interface FieldOptionDto {
  label?: string | null;
  value?: string | null;
}

export interface FieldOptionResponseEntity {
  /** @format uuid */
  id?: string;
  label?: string | null;
  value?: string | null;
  /** @format int32 */
  order?: number;
}

export interface FieldOverviewResponseEntity {
  /** @format uuid */
  fieldId?: string;
  title?: string | null;
  type?: string | null;
  isRequired?: boolean;
  /** @format int32 */
  answeredCount?: number;
  /** @format int32 */
  emptyCount?: number;
  /** @format double */
  emptyRate?: number;
  /** @format int32 */
  answerCount?: number;
  optionTrends?: OptionTrendResponseEntity[] | null;
  topValues?: ValueTrendResponseEntity[] | null;
}

export interface FieldQualityResponseEntity {
  /** @format uuid */
  fieldId?: string;
  title?: string | null;
  type?: string | null;
  /** @format int32 */
  emptyCount?: number;
  /** @format double */
  emptyRate?: number;
}

export interface FieldResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  formId?: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  type?: string | null;
  properties?: any;
  isRequired?: boolean;
  /** @format int32 */
  order?: number;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
  options?: FieldOptionResponseEntity[] | null;
}

export interface FieldWithLogicResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  formId?: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  type?: string | null;
  properties?: any;
  isRequired?: boolean;
  /** @format int32 */
  order?: number;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
  logicRules?: LogicRuleResponseEntity[] | null;
  /** @format uuid */
  defaultNextFieldId?: string | null;
  options?: FieldOptionResponseEntity[] | null;
}

export interface FormResponseEntity {
  /** @format uuid */
  id?: string;
  title?: string | null;
  slug?: string | null;
  themeConfig?: any;
  settings?: any;
  isPublished?: boolean;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
}

export interface FormSubmissionsOverviewResponseEntity {
  /** @format uuid */
  formId?: string;
  formTitle?: string | null;
  /** @format int32 */
  totalSubmissions?: number;
  /** @format int32 */
  totalFields?: number;
  /** @format int32 */
  answeredCount?: number;
  /** @format double */
  completionRate?: number;
  mostEmptyField?: FieldQualityResponseEntity;
  fields?: FieldOverviewResponseEntity[] | null;
}

export interface FormWithFieldsAndLogicResponseEntity {
  /** @format uuid */
  id?: string;
  title?: string | null;
  slug?: string | null;
  themeConfig?: any;
  settings?: any;
  isPublished?: boolean;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
  fields?: FieldWithLogicResponseEntity[] | null;
}

export interface GetDetailSubmissionsQueryResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: SubmissionResponseEntity[] | null;
}

export interface GetFieldsByFormIdQueryResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: FieldResponseEntity[] | null;
}

export interface GetFormWithFieldsAndLogicQueryResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: FormWithFieldsAndLogicResponseEntity;
}

export interface GetFormsQueryResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: FormResponseEntity[] | null;
}

export interface GetNextQuestionQuery {
  /** @format uuid */
  formId?: string;
  /** @format uuid */
  currentFieldId?: string;
  currentValue?: any;
}

export interface GetNextQuestionQueryResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: NextQuestionResponseEntity;
}

export interface GetNotificationsQueryResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: NotificationResponseEntity[] | null;
}

export interface GetPublishedFormWithFieldsAndLogicQueryResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: FormWithFieldsAndLogicResponseEntity;
}

export interface GetSubmissionByIdQueryResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: SubmissionDetailResponseEntity;
}

export interface GetSubmissionsOverviewQueryResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: FormSubmissionsOverviewResponseEntity;
}

export interface GetTemplateWithFieldsQueryResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: TemplateWithFieldsResponseEntity;
}

export interface GetTemplatesQueryResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: TemplateSummaryResponseEntity[] | null;
}

export interface LogicResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  fieldId?: string;
  condition?: string | null;
  value?: string | null;
  /** @format uuid */
  destinationFieldId?: string | null;
  /** @format int32 */
  order?: number;
  /** @format uuid */
  logicGroupId?: string | null;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
}

export interface LogicRuleResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  fieldId?: string;
  condition?: string | null;
  value?: string | null;
  /** @format uuid */
  destinationFieldId?: string | null;
  /** @format int32 */
  order?: number;
  /** @format uuid */
  logicGroupId?: string | null;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
}

export interface NextQuestionResponseEntity {
  /** @format uuid */
  nextFieldId?: string | null;
  nextField?: FieldResponseEntity;
  isEndOfForm?: boolean;
  /** @format uuid */
  appliedLogicId?: string | null;
}

export interface NotificationResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  formId?: string;
  /** @format uuid */
  latestSubmissionId?: string | null;
  message?: string | null;
  /** @format int32 */
  count?: number;
  /** @format date-time */
  firstSubmissionAt?: string | null;
  /** @format date-time */
  lastSubmissionAt?: string | null;
  isRead?: boolean;
  /** @format date-time */
  createdAt?: string | null;
  /** @format date-time */
  updatedAt?: string | null;
}

export interface OptionTrendResponseEntity {
  /** @format uuid */
  fieldOptionId?: string | null;
  label?: string | null;
  value?: string | null;
  /** @format int32 */
  count?: number;
  /** @format double */
  rate?: number;
}

export interface RegisterApplicationCommand {
  clientId?: string | null;
  clientSecret?: string | null;
  displayName?: string | null;
  clientType?: string | null;
  permissions?: string[] | null;
  redirectUris?: string[] | null;
  postLogoutRedirectUris?: string[] | null;
}

export interface ReorderFieldsCommand {
  /** @format uuid */
  formId?: string;
  fieldIdsInOrder?: string[] | null;
}

export interface ReorderFieldsCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: FieldResponseEntity[] | null;
}

export interface SubmissionDetailResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  formId?: string;
  formTitle?: string | null;
  metaData?: any;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
  answers?: AnswerDetailResponseEntity[] | null;
}

export interface SubmissionResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  formId?: string;
  metaData?: any;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
  answers?: AnswerResponseEntity[] | null;
}

export interface SubmitFormCommand {
  /** @format uuid */
  formId?: string;
  metaData?: any;
  answers?: AnswerDto[] | null;
}

export interface SubmitFormCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: SubmitFormResponseEntity;
}

export interface SubmitFormResponseEntity {
  /** @format uuid */
  submissionId?: string;
  /** @format uuid */
  formId?: string;
  /** @format date-time */
  createdAt?: string;
}

export interface TemplateFieldDataDto {
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  type?: FieldType;
  properties?: any;
  isRequired?: boolean;
  options?: TemplateFieldOptionDto[] | null;
}

export interface TemplateFieldOptionDto {
  label?: string | null;
  value?: string | null;
}

export interface TemplateFieldResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  templateId?: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  type?: string | null;
  properties?: any;
  isRequired?: boolean;
  /** @format int32 */
  order?: number;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
  options?: FieldOptionResponseEntity[] | null;
}

export interface TemplateSummaryResponseEntity {
  /** @format uuid */
  id?: string;
  title?: string | null;
  description?: string | null;
  /** @format int32 */
  fieldCount?: number;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
}

export interface TemplateWithFieldsResponseEntity {
  /** @format uuid */
  id?: string;
  title?: string | null;
  description?: string | null;
  themeConfig?: any;
  settings?: any;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
  fields?: TemplateFieldResponseEntity[] | null;
}

export interface TokenVerifyResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: TokenVerifyResponseEntity;
}

export interface TokenVerifyResponseEntity {
  /** @format uuid */
  userId?: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateFieldCommand {
  /** @format uuid */
  fieldId?: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  type?: FieldType;
  properties?: any;
  isRequired?: boolean | null;
  options?: UpdateFieldOptionDto[] | null;
}

export interface UpdateFieldCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: UpdateFieldResponseEntity;
}

export interface UpdateFieldOptionDto {
  /** @format uuid */
  id?: string | null;
  label?: string | null;
  value?: string | null;
}

export interface UpdateFieldOptionResponseEntity {
  /** @format uuid */
  id?: string;
  label?: string | null;
  value?: string | null;
  /** @format int32 */
  order?: number;
}

export interface UpdateFieldResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  formId?: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  type?: string | null;
  properties?: any;
  isRequired?: boolean;
  /** @format int32 */
  order?: number;
  /** @format date-time */
  updatedAt?: string;
  options?: UpdateFieldOptionResponseEntity[] | null;
}

export interface UpdateFormCommand {
  /** @format uuid */
  formId?: string;
  title?: string | null;
}

export interface UpdateFormCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: UpdateFormResponseEntity;
}

export interface UpdateFormPublishedStatusCommand {
  /** @format uuid */
  formId?: string;
  isPublished?: boolean;
}

export interface UpdateFormPublishedStatusCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: UpdateFormPublishedStatusResponseEntity;
}

export interface UpdateFormPublishedStatusResponseEntity {
  /** @format uuid */
  id?: string;
  isPublished?: boolean;
  /** @format date-time */
  updatedAt?: string;
}

export interface UpdateFormResponseEntity {
  /** @format uuid */
  id?: string;
  title?: string | null;
  slug?: string | null;
  themeConfig?: any;
  settings?: any;
  isPublished?: boolean;
  /** @format date-time */
  updatedAt?: string;
}

export interface UpdateLogicCommand {
  /** @format uuid */
  logicId?: string;
  /** @format uuid */
  fieldId?: string;
  condition?: LogicCondition;
  value?: string | null;
  /** @format uuid */
  destinationFieldId?: string | null;
}

export interface UpdateLogicCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: UpdateLogicResponseEntity;
}

export interface UpdateLogicResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  fieldId?: string;
  condition?: string | null;
  value?: string | null;
  /** @format uuid */
  destinationFieldId?: string | null;
  /** @format int32 */
  order?: number;
  /** @format uuid */
  logicGroupId?: string | null;
  /** @format date-time */
  updatedAt?: string;
}

export interface UpdateTemplateCommand {
  /** @format uuid */
  templateId?: string;
  title?: string | null;
  description?: string | null;
}

export interface UpdateTemplateCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: UpdateTemplateResponseEntity;
}

export interface UpdateTemplateFieldCommand {
  /** @format uuid */
  templateFieldId?: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  type?: FieldType;
  properties?: any;
  isRequired?: boolean | null;
  options?: UpdateTemplateFieldOptionDto[] | null;
}

export interface UpdateTemplateFieldCommandResponse {
  success?: boolean;
  messageId?: string | null;
  message?: string | null;
  detailErrors?: DetailError[] | null;
  response?: UpdateTemplateFieldResponseEntity;
}

export interface UpdateTemplateFieldOptionDto {
  /** @format uuid */
  id?: string | null;
  label?: string | null;
  value?: string | null;
}

export interface UpdateTemplateFieldOptionResponseEntity {
  /** @format uuid */
  id?: string;
  label?: string | null;
  value?: string | null;
  /** @format int32 */
  order?: number;
}

export interface UpdateTemplateFieldResponseEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  templateId?: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  type?: string | null;
  properties?: any;
  isRequired?: boolean;
  /** @format int32 */
  order?: number;
  /** @format date-time */
  updatedAt?: string;
  options?: UpdateTemplateFieldOptionResponseEntity[] | null;
}

export interface UpdateTemplateResponseEntity {
  /** @format uuid */
  id?: string;
  title?: string | null;
  description?: string | null;
  themeConfig?: any;
  settings?: any;
  /** @format date-time */
  updatedAt?: string;
}

export interface UserRegisterCommand {
  email?: string | null;
  password?: string | null;
  name?: string | null;
  avatar?: string | null;
  googleId?: string | null;
  /** @format uuid */
  roleId?: string | null;
}

export interface ValueTrendResponseEntity {
  value?: string | null;
  /** @format int32 */
  count?: number;
  /** @format double */
  rate?: number;
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
  public baseUrl: string = "";
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
 * @title ClientService.API
 * @version v1
 *
 * API for Client Service with OAuth2 authentication
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  connect = {
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
  api = {
    /**
     * No description
     *
     * @tags Auth
     * @name V1AuthRegisterCreate
     * @request POST:/api/v1/Auth/register
     * @secure
     */
    v1AuthRegisterCreate: (
      data: UserRegisterCommand,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/Auth/register`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name V1AuthRegisterApplicationCreate
     * @request POST:/api/v1/Auth/register-application
     * @secure
     */
    v1AuthRegisterApplicationCreate: (
      data: RegisterApplicationCommand,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/Auth/register-application`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Tạo form mới với is_published = false
     *
     * @tags Forms
     * @name V1FormsCreateFormCreate
     * @summary Tạo form mới
     * @request POST:/api/v1/Forms/CreateForm
     * @secure
     */
    v1FormsCreateFormCreate: (
      data: CreateFormCommand,
      params: RequestParams = {},
    ) =>
      this.request<CreateFormCommandResponse, any>({
        path: `/api/v1/Forms/CreateForm`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Tạo field mới cho form. Order sẽ tự động tăng dựa trên field tạo trước đó.
     *
     * @tags Forms
     * @name V1FormsCreateFieldCreate
     * @summary Tạo field mới
     * @request POST:/api/v1/Forms/CreateField
     * @secure
     */
    v1FormsCreateFieldCreate: (
      data: CreateFieldCommand,
      params: RequestParams = {},
    ) =>
      this.request<CreateFieldCommandResponse, any>({
        path: `/api/v1/Forms/CreateField`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Tạo nhiều field cho form trong một request. Order sẽ tự động tăng dựa trên field tạo trước đó.
     *
     * @tags Forms
     * @name V1FormsCreateMultipleFieldCreate
     * @summary Tạo nhiều field cùng lúc
     * @request POST:/api/v1/Forms/CreateMultipleField
     * @secure
     */
    v1FormsCreateMultipleFieldCreate: (
      data: CreateMultipleFieldCommand,
      params: RequestParams = {},
    ) =>
      this.request<CreateMultipleFieldCommandResponse, any>({
        path: `/api/v1/Forms/CreateMultipleField`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Lấy tất cả fields của form, sắp xếp theo thứ tự Order (câu nào tạo trước sẽ có Order nhỏ hơn)
     *
     * @tags Forms
     * @name V1FormsGetFieldsByFormIdList
     * @summary Lấy danh sách fields theo FormId
     * @request GET:/api/v1/Forms/GetFieldsByFormId
     * @secure
     */
    v1FormsGetFieldsByFormIdList: (
      query?: {
        /** @format uuid */
        formId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetFieldsByFormIdQueryResponse, any>({
        path: `/api/v1/Forms/GetFieldsByFormId`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Lấy tất cả forms của user đang đăng nhập, sắp xếp theo thời gian tạo (mới nhất trước)
     *
     * @tags Forms
     * @name V1FormsGetFormsList
     * @summary Lấy danh sách tất cả forms của user hiện tại
     * @request GET:/api/v1/Forms/GetForms
     * @secure
     */
    v1FormsGetFormsList: (params: RequestParams = {}) =>
      this.request<GetFormsQueryResponse, any>({
        path: `/api/v1/Forms/GetForms`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Lấy form với tất cả fields và logic rules. Mỗi field có DefaultNextFieldId (field tiếp theo theo Order mặc định)
     *
     * @tags Forms
     * @name V1FormsGetFormWithFieldsAndLogicList
     * @summary Lấy form kèm fields và logic rules
     * @request GET:/api/v1/Forms/GetFormWithFieldsAndLogic
     * @secure
     */
    v1FormsGetFormWithFieldsAndLogicList: (
      query?: {
        /** @format uuid */
        formId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetFormWithFieldsAndLogicQueryResponse, any>({
        path: `/api/v1/Forms/GetFormWithFieldsAndLogic`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Lấy form đã published (IsPublished = true) với tất cả fields và logic rules. Endpoint này không cần authentication, ai cũng có thể xem form đã published.
     *
     * @tags Forms
     * @name V1FormsGetPublishedFormWithFieldsAndLogicList
     * @summary Lấy form đã published kèm fields và logic rules
     * @request GET:/api/v1/Forms/GetPublishedFormWithFieldsAndLogic
     * @secure
     */
    v1FormsGetPublishedFormWithFieldsAndLogicList: (
      query?: {
        /** @format uuid */
        formId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetPublishedFormWithFieldsAndLogicQueryResponse, any>({
        path: `/api/v1/Forms/GetPublishedFormWithFieldsAndLogic`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Nếu logic với cùng FieldId, Condition, và Value đã tồn tại thì update, không thì tạo mới
     *
     * @tags Forms
     * @name V1FormsCreateOrUpdateLogicCreate
     * @summary Tạo hoặc cập nhật logic rule
     * @request POST:/api/v1/Forms/CreateOrUpdateLogic
     * @secure
     */
    v1FormsCreateOrUpdateLogicCreate: (
      data: CreateOrUpdateLogicCommand,
      params: RequestParams = {},
    ) =>
      this.request<CreateOrUpdateLogicCommandResponse, any>({
        path: `/api/v1/Forms/CreateOrUpdateLogic`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Update logic rule by LogicId and FieldId.
     *
     * @tags Forms
     * @name V1FormsUpdateLogicUpdate
     * @summary Update logic rule
     * @request PUT:/api/v1/Forms/UpdateLogic
     * @secure
     */
    v1FormsUpdateLogicUpdate: (
      data: UpdateLogicCommand,
      params: RequestParams = {},
    ) =>
      this.request<UpdateLogicCommandResponse, any>({
        path: `/api/v1/Forms/UpdateLogic`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Soft delete logic rule by LogicId and FieldId.
     *
     * @tags Forms
     * @name V1FormsDeleteLogicDelete
     * @summary Delete logic rule (soft delete)
     * @request DELETE:/api/v1/Forms/DeleteLogic
     * @secure
     */
    v1FormsDeleteLogicDelete: (
      query?: {
        /** @format uuid */
        fieldId?: string;
        /** @format uuid */
        logicId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DeleteLogicCommandResponse, any>({
        path: `/api/v1/Forms/DeleteLogic`,
        method: "DELETE",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Nếu IsPublished = true, sẽ kiểm tra form có title và ít nhất 1 field. Nếu false thì update bình thường.
     *
     * @tags Forms
     * @name V1FormsUpdateFormPublishedStatusCreate
     * @summary Cập nhật trạng thái publish của form
     * @request POST:/api/v1/Forms/UpdateFormPublishedStatus
     * @secure
     */
    v1FormsUpdateFormPublishedStatusCreate: (
      data: UpdateFormPublishedStatusCommand,
      params: RequestParams = {},
    ) =>
      this.request<UpdateFormPublishedStatusCommandResponse, any>({
        path: `/api/v1/Forms/UpdateFormPublishedStatus`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Submit form với answers. Form phải được published. Endpoint này không cần authentication.
     *
     * @tags Forms
     * @name V1FormsSubmitFormCreate
     * @summary Submit form
     * @request POST:/api/v1/Forms/SubmitForm
     * @secure
     */
    v1FormsSubmitFormCreate: (
      data: SubmitFormCommand,
      params: RequestParams = {},
    ) =>
      this.request<SubmitFormCommandResponse, any>({
        path: `/api/v1/Forms/SubmitForm`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Overview analytics derived from submissions (no per-answer detail). Only form owner can access.
     *
     * @tags Forms
     * @name V1FormsGetSubmissionsList
     * @summary Get submissions overview
     * @request GET:/api/v1/Forms/GetSubmissions
     * @secure
     */
    v1FormsGetSubmissionsList: (
      query?: {
        /** @format uuid */
        formId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetSubmissionsOverviewQueryResponse, any>({
        path: `/api/v1/Forms/GetSubmissions`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description All submissions with answers. Only form owner can access.
     *
     * @tags Forms
     * @name V1FormsGetDetailSubmissionsList
     * @summary Get detail submissions
     * @request GET:/api/v1/Forms/GetDetailSubmissions
     * @secure
     */
    v1FormsGetDetailSubmissionsList: (
      query?: {
        /** @format uuid */
        formId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetDetailSubmissionsQueryResponse, any>({
        path: `/api/v1/Forms/GetDetailSubmissions`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Người submit form có thể xem lại submission của họ bằng submissionId. Endpoint này không cần authentication.
     *
     * @tags Forms
     * @name V1FormsGetSubmissionByIdList
     * @summary Xem lại submission đã submit
     * @request GET:/api/v1/Forms/GetSubmissionById
     * @secure
     */
    v1FormsGetSubmissionByIdList: (
      query?: {
        /** @format uuid */
        submissionId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetSubmissionByIdQueryResponse, any>({
        path: `/api/v1/Forms/GetSubmissionById`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Lấy câu hỏi tiếp theo dựa trên logic rules. Nếu có logic match thì đi theo logic, không thì đi theo Order. Trả về IsEndOfForm = true nếu hết form.
     *
     * @tags Forms
     * @name V1FormsGetNextQuestionCreate
     * @summary Lấy câu hỏi tiếp theo
     * @request POST:/api/v1/Forms/GetNextQuestion
     * @secure
     */
    v1FormsGetNextQuestionCreate: (
      data: GetNextQuestionQuery,
      params: RequestParams = {},
    ) =>
      this.request<GetNextQuestionQueryResponse, any>({
        path: `/api/v1/Forms/GetNextQuestion`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Cập nhật thông tin form. Chỉ cần gửi các field muốn cập nhật, các field khác sẽ giữ nguyên.
     *
     * @tags Forms
     * @name V1FormsUpdateFormUpdate
     * @summary Cập nhật form
     * @request PUT:/api/v1/Forms/UpdateForm
     * @secure
     */
    v1FormsUpdateFormUpdate: (
      data: UpdateFormCommand,
      params: RequestParams = {},
    ) =>
      this.request<UpdateFormCommandResponse, any>({
        path: `/api/v1/Forms/UpdateForm`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Xóa mềm form bằng cách set IsActive = false. Chỉ owner của form mới có thể xóa.
     *
     * @tags Forms
     * @name V1FormsDeleteFormDelete
     * @summary Xóa form (soft delete)
     * @request DELETE:/api/v1/Forms/DeleteForm
     * @secure
     */
    v1FormsDeleteFormDelete: (
      query?: {
        /** @format uuid */
        formId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DeleteFormCommandResponse, any>({
        path: `/api/v1/Forms/DeleteForm`,
        method: "DELETE",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Cập nhật thông tin field. Chỉ cần gửi các field muốn cập nhật, các field khác sẽ giữ nguyên. Có thể cập nhật options bằng cách gửi danh sách options mới.
     *
     * @tags Forms
     * @name V1FormsUpdateFieldUpdate
     * @summary Cập nhật field
     * @request PUT:/api/v1/Forms/UpdateField
     * @secure
     */
    v1FormsUpdateFieldUpdate: (
      data: UpdateFieldCommand,
      params: RequestParams = {},
    ) =>
      this.request<UpdateFieldCommandResponse, any>({
        path: `/api/v1/Forms/UpdateField`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Xóa mềm field bằng cách set IsActive = false. Chỉ owner của form mới có thể xóa field.
     *
     * @tags Forms
     * @name V1FormsDeleteFieldDelete
     * @summary Xóa field (soft delete)
     * @request DELETE:/api/v1/Forms/DeleteField
     * @secure
     */
    v1FormsDeleteFieldDelete: (
      query?: {
        /** @format uuid */
        fieldId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DeleteFieldCommandResponse, any>({
        path: `/api/v1/Forms/DeleteField`,
        method: "DELETE",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Gửi danh sách FieldId theo thứ tự mong muốn để cập nhật lại Order của các field trong form.
     *
     * @tags Forms
     * @name V1FormsReorderFieldsCreate
     * @summary Cập nhật thứ tự fields trong form
     * @request POST:/api/v1/Forms/ReorderFields
     * @secure
     */
    v1FormsReorderFieldsCreate: (
      data: ReorderFieldsCommand,
      params: RequestParams = {},
    ) =>
      this.request<ReorderFieldsCommandResponse, any>({
        path: `/api/v1/Forms/ReorderFields`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Notifications
     * @name V1NotificationsStreamList
     * @request GET:/api/v1/Notifications/stream
     * @secure
     */
    v1NotificationsStreamList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/Notifications/stream`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Notifications
     * @name V1NotificationsGetNotificationsList
     * @request GET:/api/v1/Notifications/GetNotifications
     * @secure
     */
    v1NotificationsGetNotificationsList: (params: RequestParams = {}) =>
      this.request<GetNotificationsQueryResponse, any>({
        path: `/api/v1/Notifications/GetNotifications`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create template with fields
     *
     * @tags Templates
     * @name V1TemplatesCreateTemplateCreate
     * @summary Create new template
     * @request POST:/api/v1/Templates/CreateTemplate
     * @secure
     */
    v1TemplatesCreateTemplateCreate: (
      data: CreateTemplateCommand,
      params: RequestParams = {},
    ) =>
      this.request<CreateTemplateCommandResponse, any>({
        path: `/api/v1/Templates/CreateTemplate`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Auto create form and fields from template
     *
     * @tags Templates
     * @name V1TemplatesCreateFormFromTemplateCreate
     * @summary Create form from template
     * @request POST:/api/v1/Templates/CreateFormFromTemplate
     * @secure
     */
    v1TemplatesCreateFormFromTemplateCreate: (
      data: CreateFormFromTemplateCommand,
      params: RequestParams = {},
    ) =>
      this.request<CreateFormFromTemplateCommandResponse, any>({
        path: `/api/v1/Templates/CreateFormFromTemplate`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get all templates for current user
     *
     * @tags Templates
     * @name V1TemplatesGetTemplatesList
     * @summary Get templates
     * @request GET:/api/v1/Templates/GetTemplates
     * @secure
     */
    v1TemplatesGetTemplatesList: (params: RequestParams = {}) =>
      this.request<GetTemplatesQueryResponse, any>({
        path: `/api/v1/Templates/GetTemplates`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get template and fields by TemplateId
     *
     * @tags Templates
     * @name V1TemplatesGetTemplateWithFieldsList
     * @summary Get template with fields
     * @request GET:/api/v1/Templates/GetTemplateWithFields
     * @secure
     */
    v1TemplatesGetTemplateWithFieldsList: (
      query?: {
        /** @format uuid */
        templateId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetTemplateWithFieldsQueryResponse, any>({
        path: `/api/v1/Templates/GetTemplateWithFields`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update template information. Only provided fields will be updated.
     *
     * @tags Templates
     * @name V1TemplatesUpdateTemplateUpdate
     * @summary Update template
     * @request PUT:/api/v1/Templates/UpdateTemplate
     * @secure
     */
    v1TemplatesUpdateTemplateUpdate: (
      data: UpdateTemplateCommand,
      params: RequestParams = {},
    ) =>
      this.request<UpdateTemplateCommandResponse, any>({
        path: `/api/v1/Templates/UpdateTemplate`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Soft delete template by setting IsActive = false.
     *
     * @tags Templates
     * @name V1TemplatesDeleteTemplateDelete
     * @summary Delete template (soft delete)
     * @request DELETE:/api/v1/Templates/DeleteTemplate
     * @secure
     */
    v1TemplatesDeleteTemplateDelete: (
      query?: {
        /** @format uuid */
        templateId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DeleteTemplateCommandResponse, any>({
        path: `/api/v1/Templates/DeleteTemplate`,
        method: "DELETE",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update template field information. Only provided fields will be updated.
     *
     * @tags Templates
     * @name V1TemplatesUpdateTemplateFieldUpdate
     * @summary Update template field
     * @request PUT:/api/v1/Templates/UpdateTemplateField
     * @secure
     */
    v1TemplatesUpdateTemplateFieldUpdate: (
      data: UpdateTemplateFieldCommand,
      params: RequestParams = {},
    ) =>
      this.request<UpdateTemplateFieldCommandResponse, any>({
        path: `/api/v1/Templates/UpdateTemplateField`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
