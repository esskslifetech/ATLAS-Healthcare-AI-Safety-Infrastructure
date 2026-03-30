import { AtlasFhirClient } from './client';
export declare class FhirSearchBuilder {
    private params;
    addParam(key: string, value: string): FhirSearchBuilder;
    addParams(key: string, values: string[]): FhirSearchBuilder;
    patient(patientId: string): FhirSearchBuilder;
    subject(subjectId: string): FhirSearchBuilder;
    code(system: string, code: string): FhirSearchBuilder;
    codeOnly(code: string): FhirSearchBuilder;
    category(category: string): FhirSearchBuilder;
    status(status: string): FhirSearchBuilder;
    clinicalStatus(clinicalStatus: string): FhirSearchBuilder;
    verificationStatus(verificationStatus: string): FhirSearchBuilder;
    dateRange(start: string, end?: string): FhirSearchBuilder;
    date(date: string): FhirSearchBuilder;
    lastUpdated(start: string, end?: string): FhirSearchBuilder;
    identifier(system: string, value: string): FhirSearchBuilder;
    identifierOnly(value: string): FhirSearchBuilder;
    name(name: string, exact?: boolean): FhirSearchBuilder;
    family(family: string, exact?: boolean): FhirSearchBuilder;
    given(given: string, exact?: boolean): FhirSearchBuilder;
    gender(gender: string): FhirSearchBuilder;
    birthDate(birthDate: string): FhirSearchBuilder;
    address(address: string): FhirSearchBuilder;
    city(city: string): FhirSearchBuilder;
    state(state: string): FhirSearchBuilder;
    postalCode(postalCode: string): FhirSearchBuilder;
    telecom(telecom: string): FhirSearchBuilder;
    email(email: string): FhirSearchBuilder;
    phone(phone: string): FhirSearchBuilder;
    organization(organizationId: string): FhirSearchBuilder;
    encounter(encounterId: string): FhirSearchBuilder;
    performer(performerId: string): FhirSearchBuilder;
    author(authorId: string): FhirSearchBuilder;
    priority(priority: string): FhirSearchBuilder;
    intent(intent: string): FhirSearchBuilder;
    quantity(value: number, comparator?: string): FhirSearchBuilder;
    has(has: string): FhirSearchBuilder;
    include(include: string): FhirSearchBuilder;
    revInclude(revInclude: string): FhirSearchBuilder;
    sort(sort: string): FhirSearchBuilder;
    count(count: number): FhirSearchBuilder;
    page(page: number): FhirSearchBuilder;
    summary(summary: 'true' | 'false' | 'text' | 'data' | 'count'): FhirSearchBuilder;
    elements(elements: string[]): FhirSearchBuilder;
    tags(tags: string[]): FhirSearchBuilder;
    profile(profile: string): FhirSearchBuilder;
    security(security: string): FhirSearchBuilder;
    text(text: string): FhirSearchBuilder;
    content(content: string): FhirSearchBuilder;
    filter(filter: string): FhirSearchBuilder;
    build(): URLSearchParams;
    buildQueryString(): string;
    buildObject(): Record<string, string | string[]>;
    clear(): FhirSearchBuilder;
    clone(): FhirSearchBuilder;
    size(): number;
    hasParam(key: string): boolean;
    getParam(key: string): string[] | undefined;
    removeParam(key: string): FhirSearchBuilder;
}
export declare class CommonSearches {
    static activePatients(): FhirSearchBuilder;
    static patientsByName(name: string, exact?: boolean): FhirSearchBuilder;
    static vitalSigns(patientId: string, dateRange?: {
        start: string;
        end: string;
    }): FhirSearchBuilder;
    static labResults(patientId: string, dateRange?: {
        start: string;
        end: string;
    }): FhirSearchBuilder;
    static activeConditions(patientId: string): FhirSearchBuilder;
    static activeMedications(patientId: string): FhirSearchBuilder;
    static patientEncounters(patientId: string, status?: string): FhirSearchBuilder;
    static activeReferrals(patientId: string): FhirSearchBuilder;
    static byLoincCode(patientId: string, loincCode: string): FhirSearchBuilder;
    static bySnomedCode(patientId: string, snomedCode: string): FhirSearchBuilder;
    static byIcd10Code(patientId: string, icd10Code: string): FhirSearchBuilder;
    static byRxNormCode(patientId: string, rxNormCode: string): FhirSearchBuilder;
}
export interface SearchServiceConfig {
    defaultTimeoutMs: number;
    retry: RetryConfig;
    circuitBreaker: CircuitBreakerConfig;
    enableMetrics: boolean;
    enableEventLogging: boolean;
    enableTracing: boolean;
}
export interface RetryConfig {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    jitterFactor: number;
}
export interface CircuitBreakerConfig {
    failureThreshold: number;
    timeoutMs: number;
    halfOpenMaxCalls: number;
}
export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare class SearchServiceError extends Error {
    readonly code: string;
    readonly cause?: unknown | undefined;
    constructor(code: string, message: string, cause?: unknown | undefined);
}
interface MetricsSnapshot {
    searchCount: number;
    successCount: number;
    failureCount: number;
    errorCount: number;
    lastError?: string;
    resourceTypeDistribution: Record<string, number>;
    durationHistogram: number[];
}
interface EventLog {
    id: string;
    type: string;
    timestamp: string;
    source: string;
    resourceType: string;
    params: Record<string, string | string[]>;
    success: boolean;
    error?: string;
    durationMs: number;
}
interface Span {
    end(): void;
    setAttribute(key: string, value: unknown): void;
    recordException(error: Error): void;
}
interface Tracer {
    startSpan(name: string, options?: {
        attributes?: Record<string, unknown>;
    }): Span;
}
export declare function setTracer(tracer: Tracer): void;
interface HealthStatus {
    healthy: boolean;
    services: Map<string, {
        healthy: boolean;
        lastFailure?: string;
    }>;
    circuitBreakers: Map<string, {
        state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
        failures: number;
    }>;
}
export declare class SearchService {
    private client;
    private config;
    private metrics;
    private logger;
    private tracer;
    private circuitBreaker;
    private retryStrategy;
    private healthChecker;
    constructor(client: AtlasFhirClient, config?: Partial<SearchServiceConfig>);
    /**
     * Execute a search using a builder, with retry and circuit breaker.
     */
    search(resourceType: string, builder: FhirSearchBuilder): Promise<Result<any>>;
    /**
     * Execute a search with custom parameters object.
     */
    searchWithParams(resourceType: string, params: Record<string, any>): Promise<Result<any>>;
    findPatientsByName(name: string, exact?: boolean): Promise<Result<any>>;
    findActivePatients(): Promise<Result<any>>;
    findVitalSigns(patientId: string, dateRange?: {
        start: string;
        end: string;
    }): Promise<Result<any>>;
    findLabResults(patientId: string, dateRange?: {
        start: string;
        end: string;
    }): Promise<Result<any>>;
    findActiveConditions(patientId: string): Promise<Result<any>>;
    findActiveMedications(patientId: string): Promise<Result<any>>;
    findPatientEncounters(patientId: string, status?: string): Promise<Result<any>>;
    findActiveReferrals(patientId: string): Promise<Result<any>>;
    findByLoincCode(patientId: string, loincCode: string): Promise<Result<any>>;
    findBySnomedCode(patientId: string, snomedCode: string): Promise<Result<any>>;
    findByIcd10Code(patientId: string, icd10Code: string): Promise<Result<any>>;
    findByRxNormCode(patientId: string, rxNormCode: string): Promise<Result<any>>;
    getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot>;
    getEvents(): EventLog[];
    getHealth(): HealthStatus;
    getInfo(): {
        name: string;
        version: string;
        capabilities: string[];
    };
    private retryWithTimeout;
    private recordMetrics;
}
export declare function createSearchService(client: AtlasFhirClient, config?: Partial<SearchServiceConfig>): SearchService;
export {};
//# sourceMappingURL=search.d.ts.map