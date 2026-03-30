"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = exports.SearchServiceError = exports.CommonSearches = exports.FhirSearchBuilder = void 0;
exports.setTracer = setTracer;
exports.createSearchService = createSearchService;
const uuid_1 = require("uuid");
// ==================== Search Builder (unchanged, but with minor improvements) ====================
class FhirSearchBuilder {
    constructor() {
        this.params = new Map();
    }
    addParam(key, value) {
        if (!this.params.has(key))
            this.params.set(key, []);
        this.params.get(key).push(value);
        return this;
    }
    addParams(key, values) {
        if (!this.params.has(key))
            this.params.set(key, []);
        this.params.get(key).push(...values);
        return this;
    }
    patient(patientId) {
        return this.addParam('patient', patientId);
    }
    subject(subjectId) {
        return this.addParam('subject', subjectId);
    }
    code(system, code) {
        return this.addParam('code', `${system}|${code}`);
    }
    codeOnly(code) {
        return this.addParam('code', code);
    }
    category(category) {
        return this.addParam('category', category);
    }
    status(status) {
        return this.addParam('status', status);
    }
    clinicalStatus(clinicalStatus) {
        return this.addParam('clinical-status', clinicalStatus);
    }
    verificationStatus(verificationStatus) {
        return this.addParam('verification-status', verificationStatus);
    }
    dateRange(start, end) {
        if (end)
            return this.addParam('date', `ge${start}&le${end}`);
        return this.addParam('date', `ge${start}`);
    }
    date(date) {
        return this.addParam('date', date);
    }
    lastUpdated(start, end) {
        if (end)
            return this.addParam('_lastUpdated', `ge${start}&le${end}`);
        return this.addParam('_lastUpdated', `ge${start}`);
    }
    identifier(system, value) {
        return this.addParam('identifier', `${system}|${value}`);
    }
    identifierOnly(value) {
        return this.addParam('identifier', value);
    }
    name(name, exact = false) {
        return this.addParam('name', exact ? name : `${name}*`);
    }
    family(family, exact = false) {
        return this.addParam('family', exact ? family : `${family}*`);
    }
    given(given, exact = false) {
        return this.addParam('given', exact ? given : `${given}*`);
    }
    gender(gender) {
        return this.addParam('gender', gender);
    }
    birthDate(birthDate) {
        return this.addParam('birthdate', birthDate);
    }
    address(address) {
        return this.addParam('address', address);
    }
    city(city) {
        return this.addParam('city', city);
    }
    state(state) {
        return this.addParam('state', state);
    }
    postalCode(postalCode) {
        return this.addParam('postalCode', postalCode);
    }
    telecom(telecom) {
        return this.addParam('telecom', telecom);
    }
    email(email) {
        return this.addParam('email', email);
    }
    phone(phone) {
        return this.addParam('phone', phone);
    }
    organization(organizationId) {
        return this.addParam('organization', organizationId);
    }
    encounter(encounterId) {
        return this.addParam('encounter', encounterId);
    }
    performer(performerId) {
        return this.addParam('performer', performerId);
    }
    author(authorId) {
        return this.addParam('author', authorId);
    }
    priority(priority) {
        return this.addParam('priority', priority);
    }
    intent(intent) {
        return this.addParam('intent', intent);
    }
    quantity(value, comparator) {
        const valueStr = comparator ? `${comparator}${value}` : value.toString();
        return this.addParam('value-quantity', valueStr);
    }
    has(has) {
        return this.addParam('_has', has);
    }
    include(include) {
        return this.addParam('_include', include);
    }
    revInclude(revInclude) {
        return this.addParam('_revinclude', revInclude);
    }
    sort(sort) {
        return this.addParam('_sort', sort);
    }
    count(count) {
        return this.addParam('_count', count.toString());
    }
    page(page) {
        return this.addParam('_page', page.toString());
    }
    summary(summary) {
        return this.addParam('_summary', summary);
    }
    elements(elements) {
        return this.addParam('_elements', elements.join(','));
    }
    tags(tags) {
        return this.addParams('_tag', tags);
    }
    profile(profile) {
        return this.addParam('_profile', profile);
    }
    security(security) {
        return this.addParam('_security', security);
    }
    text(text) {
        return this.addParam('_text', text);
    }
    content(content) {
        return this.addParam('_content', content);
    }
    filter(filter) {
        return this.addParam('_filter', filter);
    }
    build() {
        const searchParams = new URLSearchParams();
        this.params.forEach((values, key) => {
            values.forEach(value => searchParams.append(key, value));
        });
        return searchParams;
    }
    buildQueryString() {
        return this.build().toString();
    }
    buildObject() {
        const result = {};
        this.params.forEach((values, key) => {
            result[key] = values.length === 1 ? values[0] : values;
        });
        return result;
    }
    clear() {
        this.params.clear();
        return this;
    }
    clone() {
        const newBuilder = new FhirSearchBuilder();
        this.params.forEach((values, key) => newBuilder.addParams(key, values));
        return newBuilder;
    }
    size() {
        return this.params.size;
    }
    hasParam(key) {
        return this.params.has(key);
    }
    getParam(key) {
        return this.params.get(key);
    }
    removeParam(key) {
        this.params.delete(key);
        return this;
    }
}
exports.FhirSearchBuilder = FhirSearchBuilder;
// ==================== Common Searches (unchanged) ====================
class CommonSearches {
    static activePatients() {
        return new FhirSearchBuilder().status('active');
    }
    static patientsByName(name, exact = false) {
        return new FhirSearchBuilder().name(name, exact);
    }
    static vitalSigns(patientId, dateRange) {
        const builder = new FhirSearchBuilder().patient(patientId).category('vital-signs').status('final');
        if (dateRange)
            builder.dateRange(dateRange.start, dateRange.end);
        return builder;
    }
    static labResults(patientId, dateRange) {
        const builder = new FhirSearchBuilder().patient(patientId).category('laboratory').status('final');
        if (dateRange)
            builder.dateRange(dateRange.start, dateRange.end);
        return builder;
    }
    static activeConditions(patientId) {
        return new FhirSearchBuilder().patient(patientId).clinicalStatus('active');
    }
    static activeMedications(patientId) {
        return new FhirSearchBuilder().patient(patientId).status('active');
    }
    static patientEncounters(patientId, status) {
        const builder = new FhirSearchBuilder().patient(patientId);
        if (status)
            builder.status(status);
        return builder;
    }
    static activeReferrals(patientId) {
        return new FhirSearchBuilder().patient(patientId).category('referral').status('active');
    }
    static byLoincCode(patientId, loincCode) {
        return new FhirSearchBuilder().patient(patientId).code('http://loinc.org', loincCode);
    }
    static bySnomedCode(patientId, snomedCode) {
        return new FhirSearchBuilder().patient(patientId).code('http://snomed.info/sct', snomedCode);
    }
    static byIcd10Code(patientId, icd10Code) {
        return new FhirSearchBuilder().patient(patientId).code('http://hl7.org/fhir/sid/icd-10', icd10Code);
    }
    static byRxNormCode(patientId, rxNormCode) {
        return new FhirSearchBuilder().patient(patientId).code('http://www.nlm.nih.gov/research/umls/rxnorm', rxNormCode);
    }
}
exports.CommonSearches = CommonSearches;
const defaultConfig = {
    defaultTimeoutMs: 30000,
    retry: {
        maxAttempts: 3,
        baseDelayMs: 500,
        maxDelayMs: 5000,
        jitterFactor: 0.2,
    },
    circuitBreaker: {
        failureThreshold: 5,
        timeoutMs: 60000,
        halfOpenMaxCalls: 1,
    },
    enableMetrics: true,
    enableEventLogging: true,
    enableTracing: true,
};
// ==================== Custom Error ====================
class SearchServiceError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'SearchServiceError';
    }
}
exports.SearchServiceError = SearchServiceError;
class MetricsCollector {
    constructor() {
        this.metrics = new Map();
        this.histogramBuckets = [0, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 30000];
    }
    recordSearch(moduleId, resourceType, durationMs, success, error) {
        const key = moduleId;
        let current = this.metrics.get(key);
        if (!current) {
            current = {
                searchCount: 0,
                successCount: 0,
                failureCount: 0,
                errorCount: 0,
                resourceTypeDistribution: {},
                durationHistogram: new Array(this.histogramBuckets.length).fill(0),
            };
        }
        current.searchCount++;
        if (success) {
            current.successCount++;
        }
        else {
            current.failureCount++;
            if (error) {
                current.errorCount++;
                current.lastError = error;
            }
        }
        current.resourceTypeDistribution[resourceType] = (current.resourceTypeDistribution[resourceType] || 0) + 1;
        const bucketIndex = this.histogramBuckets.findIndex(b => durationMs <= b);
        const idx = bucketIndex === -1 ? this.histogramBuckets.length - 1 : bucketIndex;
        current.durationHistogram[idx]++;
        this.metrics.set(key, current);
    }
    getMetrics(moduleId) {
        if (moduleId) {
            return this.metrics.get(moduleId) ?? {
                searchCount: 0,
                successCount: 0,
                failureCount: 0,
                errorCount: 0,
                resourceTypeDistribution: {},
                durationHistogram: new Array(this.histogramBuckets.length).fill(0),
            };
        }
        return this.metrics;
    }
}
class EventLogger {
    constructor() {
        this.events = [];
    }
    log(event) {
        this.events.push(event);
    }
    getEvents() {
        return [...this.events];
    }
}
class NoopTracer {
    startSpan() {
        return {
            end: () => { },
            setAttribute: () => { },
            recordException: () => { },
        };
    }
}
let globalTracer = new NoopTracer();
function setTracer(tracer) {
    globalTracer = tracer;
}
// ==================== Retry Strategy ====================
class ExponentialBackoffRetry {
    constructor(config) {
        this.config = config;
    }
    shouldRetry(attempt, error) {
        return attempt < this.config.maxAttempts;
    }
    getDelay(attempt) {
        const baseDelay = this.config.baseDelayMs * Math.pow(2, attempt - 1);
        const cappedDelay = Math.min(baseDelay, this.config.maxDelayMs);
        const jitter = cappedDelay * this.config.jitterFactor * (Math.random() - 0.5);
        return Math.max(0, cappedDelay + jitter);
    }
}
class CircuitBreaker {
    constructor(config) {
        this.config = config;
        this.states = new Map();
    }
    async call(serviceName, fn) {
        const state = this.getState(serviceName);
        if (state.state === 'OPEN') {
            const now = Date.now();
            if (now - state.lastFailureTime >= this.config.timeoutMs) {
                state.state = 'HALF_OPEN';
                state.halfOpenSuccesses = 0;
                this.states.set(serviceName, state);
            }
            else {
                return { ok: false, error: new SearchServiceError('CIRCUIT_OPEN', `Circuit open for service ${serviceName}`) };
            }
        }
        try {
            const result = await fn();
            if (state.state === 'HALF_OPEN') {
                state.halfOpenSuccesses++;
                if (state.halfOpenSuccesses >= this.config.halfOpenMaxCalls) {
                    state.state = 'CLOSED';
                    state.failures = 0;
                }
                this.states.set(serviceName, state);
            }
            return { ok: true, value: result };
        }
        catch (err) {
            state.failures++;
            state.lastFailureTime = Date.now();
            if (state.failures >= this.config.failureThreshold) {
                state.state = 'OPEN';
            }
            this.states.set(serviceName, state);
            return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }
    getState(serviceName) {
        return this.states.get(serviceName) ?? {
            state: 'CLOSED',
            failures: 0,
            lastFailureTime: 0,
            halfOpenSuccesses: 0,
        };
    }
    getAllStates() {
        return new Map(Array.from(this.states.entries()).map(([k, v]) => [k, { state: v.state, failures: v.failures, lastFailureTime: v.lastFailureTime }]));
    }
}
class HealthChecker {
    constructor(circuitBreaker) {
        this.circuitBreaker = circuitBreaker;
    }
    getHealth() {
        const circuitBreakers = this.circuitBreaker.getAllStates();
        const services = new Map();
        for (const [service, state] of circuitBreakers) {
            services.set(service, { healthy: state.state === 'CLOSED', lastFailure: state.lastFailureTime ? new Date(state.lastFailureTime).toISOString() : undefined });
        }
        const healthy = Array.from(services.values()).every(s => s.healthy);
        return { healthy, services, circuitBreakers };
    }
}
// ==================== Search Service ====================
class SearchService {
    constructor(client, config = {}) {
        this.client = client;
        this.config = { ...defaultConfig, ...config };
        this.metrics = new MetricsCollector();
        this.logger = new EventLogger();
        this.tracer = globalTracer;
        this.circuitBreaker = new CircuitBreaker(this.config.circuitBreaker);
        this.retryStrategy = new ExponentialBackoffRetry(this.config.retry);
        this.healthChecker = new HealthChecker(this.circuitBreaker);
    }
    /**
     * Execute a search using a builder, with retry and circuit breaker.
     */
    async search(resourceType, builder) {
        const span = this.tracer.startSpan('searchService.search');
        span.setAttribute('resourceType', resourceType);
        const startTime = Date.now();
        const params = builder.buildObject();
        try {
            const result = await this.circuitBreaker.call(`search-${resourceType}`, async () => {
                return await this.retryWithTimeout(() => this.client.search(resourceType, params), this.config.defaultTimeoutMs);
            });
            if (!result.ok)
                throw result.error;
            const duration = Date.now() - startTime;
            this.recordMetrics(resourceType, duration, true);
            span.end();
            return { ok: true, value: result.value };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics(resourceType, duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    /**
     * Execute a search with custom parameters object.
     */
    async searchWithParams(resourceType, params) {
        const builder = new FhirSearchBuilder();
        Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                builder.addParams(key, value);
            }
            else if (value !== undefined && value !== null) {
                builder.addParam(key, String(value));
            }
        });
        return this.search(resourceType, builder);
    }
    // Convenience methods using CommonSearches
    async findPatientsByName(name, exact = false) {
        const builder = CommonSearches.patientsByName(name, exact);
        return this.search('Patient', builder);
    }
    async findActivePatients() {
        const builder = CommonSearches.activePatients();
        return this.search('Patient', builder);
    }
    async findVitalSigns(patientId, dateRange) {
        const builder = CommonSearches.vitalSigns(patientId, dateRange);
        return this.search('Observation', builder);
    }
    async findLabResults(patientId, dateRange) {
        const builder = CommonSearches.labResults(patientId, dateRange);
        return this.search('Observation', builder);
    }
    async findActiveConditions(patientId) {
        const builder = CommonSearches.activeConditions(patientId);
        return this.search('Condition', builder);
    }
    async findActiveMedications(patientId) {
        const builder = CommonSearches.activeMedications(patientId);
        return this.search('MedicationRequest', builder);
    }
    async findPatientEncounters(patientId, status) {
        const builder = CommonSearches.patientEncounters(patientId, status);
        return this.search('Encounter', builder);
    }
    async findActiveReferrals(patientId) {
        const builder = CommonSearches.activeReferrals(patientId);
        return this.search('ServiceRequest', builder);
    }
    async findByLoincCode(patientId, loincCode) {
        const builder = CommonSearches.byLoincCode(patientId, loincCode);
        return this.search('Observation', builder);
    }
    async findBySnomedCode(patientId, snomedCode) {
        const builder = CommonSearches.bySnomedCode(patientId, snomedCode);
        return this.search('Condition', builder);
    }
    async findByIcd10Code(patientId, icd10Code) {
        const builder = CommonSearches.byIcd10Code(patientId, icd10Code);
        return this.search('Condition', builder);
    }
    async findByRxNormCode(patientId, rxNormCode) {
        const builder = CommonSearches.byRxNormCode(patientId, rxNormCode);
        return this.search('MedicationRequest', builder);
    }
    // ==================== Observability ====================
    getMetrics(moduleId) {
        return this.metrics.getMetrics(moduleId);
    }
    getEvents() {
        return this.logger.getEvents();
    }
    getHealth() {
        return this.healthChecker.getHealth();
    }
    getInfo() {
        return {
            name: 'FHIR Search Service',
            version: '1.0.0',
            capabilities: [
                'search_execution',
                'builder_pattern',
                'common_searches',
                'circuit_breaker',
                'retry_with_backoff',
                'observability',
            ],
        };
    }
    // ==================== Private Helpers ====================
    async retryWithTimeout(fn, timeoutMs) {
        return new Promise(async (resolve, reject) => {
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);
            let attempt = 0;
            const executeWithRetry = async () => {
                while (attempt < this.config.retry.maxAttempts) {
                    try {
                        const result = await fn();
                        clearTimeout(timeoutId);
                        resolve(result);
                        return;
                    }
                    catch (err) {
                        attempt++;
                        if (!this.retryStrategy.shouldRetry(attempt, err)) {
                            clearTimeout(timeoutId);
                            reject(err);
                            return;
                        }
                        const delay = this.retryStrategy.getDelay(attempt);
                        await new Promise(r => setTimeout(r, delay));
                    }
                }
                clearTimeout(timeoutId);
                reject(new Error('Max retries exceeded'));
            };
            executeWithRetry();
        });
    }
    recordMetrics(resourceType, durationMs, success, error) {
        if (this.config.enableMetrics) {
            this.metrics.recordSearch('search-service', resourceType, durationMs, success, error);
        }
        if (this.config.enableEventLogging) {
            this.logger.log({
                id: (0, uuid_1.v4)(),
                type: 'SEARCH',
                timestamp: new Date().toISOString(),
                source: 'search-service',
                resourceType,
                params: {}, // params could be passed if needed
                success,
                error,
                durationMs,
            });
        }
    }
}
exports.SearchService = SearchService;
// ==================== Convenience Factory ====================
function createSearchService(client, config) {
    return new SearchService(client, config);
}
//# sourceMappingURL=search.js.map