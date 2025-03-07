import axios, { AxiosPromise } from "axios";
import { APIClient } from "@app/axios-config";

import {
  AnalysisDependency,
  BaseAnalysisRuleReport,
  BaseAnalysisIssueReport,
  AnalysisIssue,
  AnalysisFileReport,
  AnalysisIncident,
  Application,
  ApplicationAdoptionPlan,
  ApplicationDependency,
  ApplicationImport,
  ApplicationImportSummary,
  Assessment,
  AssessmentConfidence,
  AssessmentQuestionRisk,
  AssessmentRisk,
  BulkCopyAssessment,
  BulkCopyReview,
  BusinessService,
  Cache,
  HubPaginatedResult,
  HubRequestParams,
  Identity,
  IReadFile,
  Tracker,
  JobFunction,
  Proxy,
  Review,
  Setting,
  SettingTypes,
  Stakeholder,
  StakeholderGroup,
  Tag,
  TagCategory,
  Task,
  Taskgroup,
  MigrationWave,
  Ticket,
  New,
  Ref,
  TrackerProject,
  TrackerProjectIssuetype,
  Fact,
  UnstructuredFact,
  AnalysisAppDependency,
  AnalysisAppReport,
  Rule,
  Target,
  HubFile,
  Questionnaire,
} from "./models";
import { QueryKey } from "@tanstack/react-query";
import { serializeRequestParamsForHub } from "@app/hooks/table-controls";

// TACKLE_HUB
export const HUB = "/hub";

export const BUSINESS_SERVICES = HUB + "/businessservices";
export const STAKEHOLDERS = HUB + "/stakeholders";
export const STAKEHOLDER_GROUPS = HUB + "/stakeholdergroups";
export const JOB_FUNCTIONS = HUB + "/jobfunctions";
export const TAG_CATEGORIES = HUB + "/tagcategories";
export const TAGS = HUB + "/tags";
export const MIGRATION_WAVES = HUB + "/migrationwaves";

export const APPLICATIONS = HUB + "/applications";
export const APPLICATION_DEPENDENCY = HUB + "/dependencies";
export const REVIEWS = HUB + "/reviews";
export const REPORT = HUB + "/reports";
export const UPLOAD_FILE = HUB + "/importsummaries/upload";
export const APP_IMPORT_SUMMARY = HUB + "/importsummaries";
export const APP_IMPORT = HUB + "/imports";
export const APP_IMPORT_CSV = HUB + "/importsummaries/download";

export const IDENTITIES = HUB + "/identities";
export const PROXIES = HUB + "/proxies";
export const SETTINGS = HUB + "/settings";
export const TASKS = HUB + "/tasks";
export const TASKGROUPS = HUB + "/taskgroups";
export const TRACKERS = HUB + "/trackers";
export const TRACKER_PROJECTS = "projects";
export const TRACKER_PROJECT_ISSUETYPES = "issuetypes";
export const TICKETS = HUB + "/tickets";
export const FACTS = HUB + "/facts";

export const TARGETS = HUB + "/targets";
export const FILES = HUB + "/files";
export const CACHE = HUB + "/cache/m2";

export const ANALYSIS_DEPENDENCIES = HUB + "/analyses/report/dependencies";
export const ANALYSIS_REPORT_RULES = HUB + "/analyses/report/rules";
export const ANALYSIS_REPORT_ISSUES_APPS =
  HUB + "/analyses/report/issues/applications";
export const ANALYSIS_REPORT_APP_ISSUES =
  HUB + "/analyses/report/applications/:applicationId/issues";
export const ANALYSIS_REPORT_ISSUE_FILES =
  HUB + "/analyses/report/issues/:issueId/files";

export const ANALYSIS_REPORT_APP_DEPENDENCIES =
  HUB + "/analyses/report/dependencies/applications";

export const ANALYSIS_REPORT_FILES = HUB + "/analyses/report/issues/:id/files";
export const ANALYSIS_ISSUES = HUB + "/analyses/issues";
export const ANALYSIS_ISSUE_INCIDENTS =
  HUB + "/analyses/issues/:issueId/incidents";

export const QUESTIONNAIRES = HUB + "/questionnaires";

// PATHFINDER
export const PATHFINDER = "/hub/pathfinder";
export const ASSESSMENTS = PATHFINDER + "/assessments";

const jsonHeaders = { headers: { Accept: "application/json" } };
const formHeaders = { headers: { Accept: "multipart/form-data" } };
const fileHeaders = { headers: { Accept: "application/json" } };
const yamlHeaders = { headers: { Accept: "application/x-yaml" } };

type Direction = "asc" | "desc";

const buildQuery = (params: any) => {
  const query: string[] = [];

  Object.keys(params).forEach((key) => {
    const value = (params as any)[key];

    if (value !== undefined && value !== null) {
      let queryParamValues: string[] = [];
      if (Array.isArray(value)) {
        queryParamValues = value;
      } else {
        queryParamValues = [value];
      }
      queryParamValues.forEach((v) => query.push(`${key}=${v}`));
    }
  });

  return query;
};

// App inventory

export const updateAllApplications = (
  updatePromises: Promise<Application>[]
) => {
  return Promise.all(updatePromises)
    .then((response) => response)
    .catch((error) => error);
};

export const getApplicationById = (
  id: number | string
): AxiosPromise<Application> => {
  return APIClient.get(`${APPLICATIONS}/${id}`);
};

// Applications Dependencies

export const getApplicationDependencies = (): AxiosPromise<
  ApplicationDependency[]
> => {
  return APIClient.get(`${APPLICATION_DEPENDENCY}`, jsonHeaders);
};

export const createApplicationDependency = (
  obj: ApplicationDependency
): AxiosPromise<ApplicationDependency> => {
  return APIClient.post(`${APPLICATION_DEPENDENCY}`, obj);
};

export const deleteApplicationDependency = (id: number): AxiosPromise => {
  return APIClient.delete(`${APPLICATION_DEPENDENCY}/${id}`);
};

// Reviews

export const getReviews = (): AxiosPromise<Review[]> => {
  return APIClient.get(`${REVIEWS}`);
};

export const getReviewId = (id: number | string): AxiosPromise<Review> => {
  return APIClient.get(`${REVIEWS}/${id}`);
};

export const createReview = (obj: Review): AxiosPromise<Review> => {
  return APIClient.post(`${REVIEWS}`, obj);
};

export const updateReview = (obj: Review): AxiosPromise<Review> => {
  return APIClient.put(`${REVIEWS}/${obj.id}`, obj);
};

export const deleteReview = (id: number): AxiosPromise => {
  return APIClient.delete(`${REVIEWS}/${id}`);
};

export const getApplicationAdoptionPlan = (
  applicationIds: number[]
): AxiosPromise<ApplicationAdoptionPlan[]> => {
  return APIClient.post(
    `${REPORT}/adoptionplan`,
    applicationIds.map((f) => ({
      applicationId: f,
    }))
  );
};

export const getApplicationSummaryCSV = (id: string): AxiosPromise => {
  return APIClient.get(`${APP_IMPORT_CSV}?importSummaryId=${id}`, {
    responseType: "arraybuffer",
    headers: { Accept: "text/csv", responseType: "blob" },
  });
};

//

export const getAssessments = (filters: {
  applicationId?: number | string;
}): AxiosPromise<Assessment[]> => {
  const params = {
    applicationId: filters.applicationId,
  };

  const query: string[] = buildQuery(params);
  return APIClient.get(`${ASSESSMENTS}?${query.join("&")}`);
};

export const createAssessment = (obj: Assessment): AxiosPromise<Assessment> => {
  return APIClient.post(`${ASSESSMENTS}`, obj);
};

export const patchAssessment = (obj: Assessment): AxiosPromise<Assessment> => {
  return APIClient.patch(`${ASSESSMENTS}/${obj.id}`, obj);
};

export const getAssessmentById = (
  id: number | string
): AxiosPromise<Assessment> => {
  return APIClient.get(`${ASSESSMENTS}/${id}`);
};

export const deleteAssessment = (id: number): AxiosPromise => {
  return APIClient.delete(`${ASSESSMENTS}/${id}`);
};

export const getAssessmentLandscape = (
  applicationIds: number[]
): AxiosPromise<AssessmentRisk[]> => {
  return APIClient.post(
    `${ASSESSMENTS}/assessment-risk`,
    applicationIds.map((f) => ({ applicationId: f }))
  );
};

export const getAssessmentIdentifiedRisks = (
  applicationIds: number[]
): AxiosPromise<AssessmentQuestionRisk[]> => {
  return APIClient.post(
    `${ASSESSMENTS}/risks`,
    applicationIds.map((f) => ({ applicationId: f }))
  );
};

export const getAssessmentConfidence = (
  applicationIds: number[]
): AxiosPromise<AssessmentConfidence[]> => {
  return APIClient.post(
    `${ASSESSMENTS}/confidence`,
    applicationIds.map((f) => ({ applicationId: f }))
  );
};

export const createBulkCopyAssessment = (
  bulk: BulkCopyAssessment
): AxiosPromise<BulkCopyAssessment> => {
  return APIClient.post<BulkCopyAssessment>(`${ASSESSMENTS}/bulk`, bulk);
};

export const getBulkCopyAssessment = ({
  queryKey,
}: {
  queryKey: QueryKey;
}): AxiosPromise<BulkCopyAssessment> => {
  const [_, id] = queryKey;
  return APIClient.get<BulkCopyAssessment>(`${ASSESSMENTS}/bulk/${id}`);
};

export const createBulkCopyReview = (
  bulk: BulkCopyReview
): AxiosPromise<BulkCopyReview> => {
  return APIClient.post<BulkCopyReview>(`${REVIEWS}/copy`, bulk);
};

export const getIdentities = (): AxiosPromise<Array<Identity>> => {
  return APIClient.get(`${IDENTITIES}`, jsonHeaders);
};

export const createIdentity = (obj: New<Identity>): AxiosPromise<Identity> => {
  return APIClient.post(`${IDENTITIES}`, obj);
};

export const updateIdentity = (obj: Identity): AxiosPromise<Identity> => {
  return APIClient.put(`${IDENTITIES}/${obj.id}`, obj);
};

export const deleteIdentity = (identity: Identity): AxiosPromise => {
  return APIClient.delete(`${IDENTITIES}/${identity.id}`);
};

// Axios direct

export const createApplication = (obj: Application): Promise<Application> =>
  axios.post(`${APPLICATIONS}`, obj);

export const deleteApplication = (id: number): Promise<Application> =>
  axios.delete(`${APPLICATIONS}/${id}`);

export const deleteBulkApplications = (ids: number[]): Promise<Application[]> =>
  axios.delete(APPLICATIONS, { data: ids });

export const getApplications = (): Promise<Application[]> =>
  axios.get(APPLICATIONS).then((response) => response.data);

export const updateApplication = (obj: Application): Promise<Application> =>
  axios.put(`${APPLICATIONS}/${obj.id}`, obj);

export const getApplicationsImportSummary = (): Promise<
  ApplicationImportSummary[]
> => axios.get(APP_IMPORT_SUMMARY).then((response) => response.data);

export const getApplicationImportSummaryById = (
  id: number | string
): Promise<ApplicationImportSummary> =>
  axios.get(`${APP_IMPORT_SUMMARY}/${id}`).then((response) => response.data);

export const deleteApplicationImportSummary = (
  id: number
): Promise<ApplicationImportSummary> =>
  axios.delete(`${APP_IMPORT_SUMMARY}/${id}`);

export const getApplicationImports = (
  importSummaryID: number,
  isValid: boolean | string
): Promise<ApplicationImport[]> =>
  axios
    .get(`${APP_IMPORT}?importSummary.id=${importSummaryID}&isValid=${isValid}`)
    .then((response) => response.data);

export const getApplicationAnalysis = (
  applicationId: number,
  format: "json" | "yaml"
): Promise<string> => {
  const headers = format === "yaml" ? yamlHeaders : jsonHeaders;
  return axios
    .get<string>(`${APPLICATIONS}/${applicationId}/analysis`, headers)
    .then((response) => response.data);
};

export function getTaskById(id: number, format: "json"): Promise<Task>;
export function getTaskById(id: number, format: "yaml"): Promise<string>;
export function getTaskById(
  id: number,
  format: "json" | "yaml"
): Promise<Task | string> {
  if (format === "yaml") {
    return axios
      .get<Task>(`${TASKS}/${id}`, yamlHeaders)
      .then((response) => response.data);
  } else {
    return axios
      .get<string>(`${TASKS}/${id}`, jsonHeaders)
      .then((response) => response.data);
  }
}

export const getTasks = () =>
  axios.get<Task[]>(TASKS).then((response) => response.data);

export const deleteTask = (id: number) => axios.delete<Task>(`${TASKS}/${id}`);

export const cancelTask = (id: number) =>
  axios.put<Task>(`${TASKS}/${id}/cancel`);

export const createTaskgroup = (obj: Taskgroup) =>
  axios.post<Taskgroup>(TASKGROUPS, obj).then((response) => response.data);

export const submitTaskgroup = (obj: Taskgroup) =>
  axios
    .put<Taskgroup>(`${TASKGROUPS}/${obj.id}/submit`, obj)
    .then((response) => response.data);

export const deleteTaskgroup = (id: number): AxiosPromise =>
  axios.delete(`${TASKGROUPS}/${id}`);

export const uploadFileTaskgroup = ({
  id,
  path,
  formData,
  file,
}: {
  id: number;
  path: string;
  formData: any;
  file: any;
}) => {
  return axios.post<Taskgroup>(
    `${TASKGROUPS}/${id}/bucket/${path}`,
    formData,
    formHeaders
  );
};

export const removeFileTaskgroup = ({
  id,
  path,
}: {
  id: number;
  path: string;
}) => {
  return axios.delete<Taskgroup>(`${TASKGROUPS}/${id}/bucket/${path}`);
};

export const getMigrationWaves = (): Promise<MigrationWave[]> =>
  axios.get(MIGRATION_WAVES).then((response) => response.data);

export const createMigrationWave = (
  obj: New<MigrationWave>
): Promise<MigrationWave> => axios.post(MIGRATION_WAVES, obj);

export const deleteMigrationWave = (id: number): Promise<MigrationWave> =>
  axios.delete(`${MIGRATION_WAVES}/${id}`);

export const updateMigrationWave = (
  obj: MigrationWave
): Promise<MigrationWave> => axios.put(`${MIGRATION_WAVES}/${obj.id}`, obj);

export const deleteAllMigrationWaves = (
  deletePromises: Promise<MigrationWave>[]
) => {
  return Promise.all(deletePromises)
    .then((response) => response)
    .catch((error) => error);
};

export const updateTarget = (obj: Target): Promise<Target> =>
  axios.put(`${TARGETS}/${obj.id}`, obj);

export const createTarget = (obj: Target): Promise<Target> =>
  axios.post(TARGETS, obj);

export const deleteTarget = (id: number): Promise<Target> =>
  axios.delete(`${TARGETS}/${id}`);

export const getTargets = (): Promise<Target[]> =>
  axios.get(TARGETS).then((response) => response.data);

export const createFile = ({
  formData,
  file,
}: {
  formData: FormData;
  file: IReadFile;
}) =>
  axios
    .post<HubFile>(`${FILES}/${file.fileName}`, formData, fileHeaders)
    .then((response) => {
      return response.data;
    });

export const getSettingById = <K extends keyof SettingTypes>(
  id: K
): Promise<SettingTypes[K]> =>
  axios.get(`${SETTINGS}/${id}`).then((response) => response.data);

export const updateSetting = <K extends keyof SettingTypes>(
  obj: Setting<K>
): Promise<Setting<K>> =>
  axios.put(
    `${SETTINGS}/${obj.key}`,
    typeof obj.value == "boolean" ? obj.value.toString() : obj.value
  );

export const getCache = (): Promise<Cache> =>
  axios.get(CACHE).then((response) => response.data);

export const deleteCache = (): Promise<Cache> => axios.delete(CACHE);

// Trackers

export const getTrackers = (): Promise<Tracker[]> =>
  axios.get(TRACKERS).then((response) => response.data);

export const createTracker = (obj: Tracker): Promise<Tracker> =>
  axios.post(TRACKERS, obj);

export const updateTracker = (obj: Tracker): Promise<Tracker> =>
  axios.put(`${TRACKERS}/${obj.id}`, obj);

export const deleteTracker = (id: number): Promise<Tracker> =>
  axios.delete(`${TRACKERS}/${id}`);

export const getTrackerProjects = (id: number): Promise<TrackerProject[]> =>
  axios
    .get(`${TRACKERS}/${id}/${TRACKER_PROJECTS}`)
    .then((response) => response.data);

export const getTrackerProjectIssuetypes = (
  trackerId: number,
  projectId: string
): Promise<TrackerProjectIssuetype[]> =>
  axios
    .get(
      `${TRACKERS}/${trackerId}/${TRACKER_PROJECTS}/${projectId}/${TRACKER_PROJECT_ISSUETYPES}`
    )
    .then((response) => response.data);

// Issues and Dependencies

export const getHubPaginatedResult = <T>(
  url: string,
  params: HubRequestParams = {}
): Promise<HubPaginatedResult<T>> =>
  axios
    .get<T[]>(url, {
      params: serializeRequestParamsForHub(params),
    })
    .then(({ data, headers }) => ({
      data,
      total: headers["x-total"] ? parseInt(headers["x-total"], 10) : 0,
      params,
    }));

export const getRuleReports = (params: HubRequestParams = {}) =>
  getHubPaginatedResult<BaseAnalysisRuleReport>(ANALYSIS_REPORT_RULES, params);

export const getAppReports = (params: HubRequestParams = {}) =>
  getHubPaginatedResult<AnalysisAppReport>(ANALYSIS_REPORT_ISSUES_APPS, params);

export const getIssueReports = (
  applicationId?: number,
  params: HubRequestParams = {}
) =>
  getHubPaginatedResult<BaseAnalysisIssueReport>(
    ANALYSIS_REPORT_APP_ISSUES.replace(
      "/:applicationId/",
      `/${String(applicationId)}/`
    )
  );

export const getIssues = (params: HubRequestParams = {}) =>
  getHubPaginatedResult<AnalysisIssue>(ANALYSIS_ISSUES, params);

export const getIssue = (issueId: number): Promise<AnalysisIssue> =>
  axios
    .get(`${ANALYSIS_ISSUES}/${String(issueId)}`)
    .then((response) => response.data);

export const getFileReports = (
  issueId?: number,
  params: HubRequestParams = {}
) =>
  issueId
    ? getHubPaginatedResult<AnalysisFileReport>(
        ANALYSIS_REPORT_ISSUE_FILES.replace(
          "/:issueId/",
          `/${String(issueId)}/`
        ),
        params
      )
    : Promise.reject();

export const getIncidents = (issueId?: number, params: HubRequestParams = {}) =>
  issueId
    ? getHubPaginatedResult<AnalysisIncident>(
        ANALYSIS_ISSUE_INCIDENTS.replace("/:issueId/", `/${String(issueId)}/`),
        params
      )
    : Promise.reject();

export const getDependencies = (params: HubRequestParams = {}) =>
  getHubPaginatedResult<AnalysisDependency>(ANALYSIS_DEPENDENCIES, params);

export const getAppDependencies = (params: HubRequestParams = {}) =>
  getHubPaginatedResult<AnalysisAppDependency>(
    ANALYSIS_REPORT_APP_DEPENDENCIES,
    params
  );

// Tickets
export const createTickets = (payload: New<Ticket>, applications: Ref[]) => {
  const promises: AxiosPromise[] = [];

  applications.map((app) => {
    const appPayload: New<Ticket> = {
      ...payload,
      application: { id: app.id, name: app.name },
    };
    return [...promises, axios.post(TICKETS, appPayload)];
  });
  return Promise.all<AxiosPromise<Ticket>>(promises);
};

export const getTickets = (): Promise<Ticket[]> =>
  axios.get(TICKETS).then((response) => response.data);

export const deleteTicket = (id: number): Promise<Ticket> =>
  axios.delete(`${TICKETS}/${id}`);

// Stakeholders

export const getStakeholders = (): Promise<Stakeholder[]> =>
  axios.get(STAKEHOLDERS).then((response) => response.data);

export const deleteStakeholder = (id: number): Promise<Stakeholder> =>
  axios.delete(`${STAKEHOLDERS}/${id}`);

export const createStakeholder = (
  obj: New<Stakeholder>
): Promise<Stakeholder> => axios.post(STAKEHOLDERS, obj);

export const updateStakeholder = (obj: Stakeholder): Promise<Stakeholder> =>
  axios.put(`${STAKEHOLDERS}/${obj.id}`, obj);

// Stakeholder groups

export enum StakeholderGroupSortBy {
  NAME,
  STAKEHOLDERS_COUNT,
}

export const getStakeholderGroups = (): Promise<StakeholderGroup[]> =>
  axios.get(STAKEHOLDER_GROUPS).then((response) => response.data);

export const deleteStakeholderGroup = (id: number): Promise<StakeholderGroup> =>
  axios.delete(`${STAKEHOLDER_GROUPS}/${id}`);

export const createStakeholderGroup = (
  obj: New<StakeholderGroup>
): Promise<StakeholderGroup> => axios.post(STAKEHOLDER_GROUPS, obj);

export const updateStakeholderGroup = (
  obj: StakeholderGroup
): Promise<StakeholderGroup> =>
  axios.put(`${STAKEHOLDER_GROUPS}/${obj.id}`, obj);

// Business services

export const getBusinessServices = (): Promise<BusinessService[]> =>
  axios.get(BUSINESS_SERVICES).then((response) => response.data);

export const deleteBusinessService = (
  id: number | string
): Promise<BusinessService> => axios.delete(`${BUSINESS_SERVICES}/${id}`);

export const createBusinessService = (
  obj: New<BusinessService>
): Promise<BusinessService> => axios.post(BUSINESS_SERVICES, obj);

export const updateBusinessService = (
  obj: BusinessService
): Promise<BusinessService> => axios.put(`${BUSINESS_SERVICES}/${obj.id}`, obj);

export const getBusinessServiceById = (
  id: number | string
): Promise<BusinessService> =>
  axios.get(`${BUSINESS_SERVICES}/${id}`).then((response) => response.data);

// Job functions

export enum JobFunctionSortBy {
  NAME,
}

export interface JobFunctionSortByQuery {
  field: JobFunctionSortBy;
  direction?: Direction;
}

export const getJobFunctions = (): Promise<JobFunction[]> =>
  axios.get(JOB_FUNCTIONS).then((response) => response.data);

export const createJobFunction = (
  obj: New<JobFunction>
): Promise<JobFunction> => axios.post(JOB_FUNCTIONS, obj);

export const updateJobFunction = (obj: JobFunction): Promise<JobFunction> =>
  axios.put(`${JOB_FUNCTIONS}/${obj.id}`, obj);

export const deleteJobFunction = (id: number): Promise<JobFunction> =>
  axios.delete(`${JOB_FUNCTIONS}/${id}`);

// Tags

export const getTags = (): Promise<Tag[]> =>
  axios.get(TAGS).then((response) => response.data);

export const getTagById = (id: number | string): Promise<Tag> =>
  axios.get(`${TAGS}/${id}`).then((response) => response.data);

export const createTag = (obj: New<Tag>): Promise<Tag> => axios.post(TAGS, obj);

export const deleteTag = (id: number): Promise<Tag> =>
  axios.delete(`${TAGS}/${id}`);

export const updateTag = (obj: Tag): Promise<Tag> =>
  axios.put(`${TAGS}/${obj.id}`, obj);

// Tag categories

export const getTagCategories = (): Promise<Array<TagCategory>> =>
  axios.get(TAG_CATEGORIES).then((response) => response.data);

export const getTagCategoryById = (id: number): Promise<TagCategory> =>
  axios.get(`${TAG_CATEGORIES}/${id}`).then((response) => response.data);

export const deleteTagCategory = (id: number): Promise<TagCategory> =>
  axios.delete(`${TAG_CATEGORIES}/${id}`);

export const createTagCategory = (
  obj: New<TagCategory>
): Promise<TagCategory> => axios.post(TAG_CATEGORIES, obj);

export const updateTagCategory = (obj: TagCategory): Promise<TagCategory> =>
  axios.put(`${TAG_CATEGORIES}/${obj.id}`, obj);

// Facts

export const getFacts = (
  id: number | string | undefined
): Promise<UnstructuredFact> =>
  //TODO: Address this when moving to structured facts api
  id
    ? axios.get(`${APPLICATIONS}/${id}/facts`).then((response) => response.data)
    : Promise.reject();

// Proxies

export const getProxies = (): Promise<Proxy[]> =>
  axios.get(PROXIES).then((response) => response.data);

export const updateProxy = (obj: Proxy): Promise<Proxy> =>
  axios.put(`${PROXIES}/${obj.id}`, obj);

// Questionnaires

export const getQuestionnaires = (): Promise<Questionnaire[]> =>
  axios.get(QUESTIONNAIRES).then((response) => response.data);

// TODO: The update handlers in hub don't return any content (success is a response code
// TODO:  of 204 - NoContext) ... the return type does not make sense.
export const updateQuestionnaire = (
  obj: Questionnaire
): Promise<Questionnaire> => axios.put(`${QUESTIONNAIRES}/${obj.id}`, obj);

// TODO: The delete handlers in hub don't return any content (success is a response code
// TODO:  of 204 - NoContext) ... the return type does not make sense.
export const deleteQuestionnaire = (id: number): Promise<Questionnaire> =>
  axios.delete(`${QUESTIONNAIRES}/${id}`);
