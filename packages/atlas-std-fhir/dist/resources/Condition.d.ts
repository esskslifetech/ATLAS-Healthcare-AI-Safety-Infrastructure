import { z } from 'zod';
import { AtlasFhirClient } from '../client';
export declare const ConditionEvidenceSchema: z.ZodObject<{
    code: z.ZodOptional<z.ZodArray<z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
        text: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }>, "many">>;
    detail: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    code?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    detail?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
}, {
    code?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    detail?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
}>;
export declare const ConditionSchema: z.ZodObject<{
    resourceType: z.ZodLiteral<"Condition">;
    id: z.ZodOptional<z.ZodString>;
    identifier: z.ZodOptional<z.ZodArray<z.ZodObject<{
        use: z.ZodOptional<z.ZodEnum<["usual", "official", "temp", "secondary", "old"]>>;
        type: z.ZodOptional<z.ZodObject<{
            coding: z.ZodArray<z.ZodObject<{
                system: z.ZodString;
                code: z.ZodString;
                display: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                system: string;
                display?: string | undefined;
            }, {
                code: string;
                system: string;
                display?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }>>;
        system: z.ZodOptional<z.ZodString>;
        value: z.ZodString;
        period: z.ZodOptional<z.ZodObject<{
            start: z.ZodOptional<z.ZodString>;
            end: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            start?: string | undefined;
            end?: string | undefined;
        }, {
            start?: string | undefined;
            end?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        value: string;
        type?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        use?: "usual" | "official" | "temp" | "secondary" | "old" | undefined;
        system?: string | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }, {
        value: string;
        type?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        use?: "usual" | "official" | "temp" | "secondary" | "old" | undefined;
        system?: string | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }>, "many">>;
    clinicalStatus: z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }>;
    verificationStatus: z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }>;
    category: z.ZodOptional<z.ZodArray<z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
        text: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }>, "many">>;
    severity: z.ZodOptional<z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }>>;
    code: z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
        text: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }>;
    bodySite: z.ZodOptional<z.ZodArray<z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
        text: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }>, "many">>;
    subject: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
    encounter: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
    onsetDateTime: z.ZodOptional<z.ZodString>;
    onsetAge: z.ZodOptional<z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodString;
        system: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    }, {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    }>>;
    onsetPeriod: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end?: string | undefined;
    }, {
        start: string;
        end?: string | undefined;
    }>>;
    onsetRange: z.ZodOptional<z.ZodObject<{
        low: z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>;
        high: z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        low: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        high: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    }, {
        low: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        high: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    }>>;
    abatementDateTime: z.ZodOptional<z.ZodString>;
    abatementAge: z.ZodOptional<z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodString;
        system: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    }, {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    }>>;
    abatementPeriod: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end?: string | undefined;
    }, {
        start: string;
        end?: string | undefined;
    }>>;
    abatementRange: z.ZodOptional<z.ZodObject<{
        low: z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>;
        high: z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        low: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        high: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    }, {
        low: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        high: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    }>>;
    abatementString: z.ZodOptional<z.ZodString>;
    recordedDate: z.ZodOptional<z.ZodString>;
    recorder: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
    asserter: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
    note: z.ZodOptional<z.ZodArray<z.ZodObject<{
        authorString: z.ZodOptional<z.ZodString>;
        time: z.ZodOptional<z.ZodString>;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        authorString?: string | undefined;
        time?: string | undefined;
    }, {
        text: string;
        authorString?: string | undefined;
        time?: string | undefined;
    }>, "many">>;
    evidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
        code: z.ZodOptional<z.ZodArray<z.ZodObject<{
            coding: z.ZodArray<z.ZodObject<{
                system: z.ZodString;
                code: z.ZodString;
                display: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                system: string;
                display?: string | undefined;
            }, {
                code: string;
                system: string;
                display?: string | undefined;
            }>, "many">;
            text: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }>, "many">>;
        detail: z.ZodOptional<z.ZodArray<z.ZodObject<{
            reference: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            reference: string;
            display?: string | undefined;
        }, {
            reference: string;
            display?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        code?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        detail?: {
            reference: string;
            display?: string | undefined;
        }[] | undefined;
    }, {
        code?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        detail?: {
            reference: string;
            display?: string | undefined;
        }[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    code: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    };
    resourceType: "Condition";
    clinicalStatus: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    };
    verificationStatus: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    };
    id?: string | undefined;
    identifier?: {
        value: string;
        type?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        use?: "usual" | "official" | "temp" | "secondary" | "old" | undefined;
        system?: string | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }[] | undefined;
    category?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    subject?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    encounter?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    bodySite?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    note?: {
        text: string;
        authorString?: string | undefined;
        time?: string | undefined;
    }[] | undefined;
    recorder?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    severity?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    } | undefined;
    onsetDateTime?: string | undefined;
    onsetAge?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    onsetPeriod?: {
        start: string;
        end?: string | undefined;
    } | undefined;
    onsetRange?: {
        low: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        high: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    } | undefined;
    abatementDateTime?: string | undefined;
    abatementAge?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    abatementPeriod?: {
        start: string;
        end?: string | undefined;
    } | undefined;
    abatementRange?: {
        low: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        high: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    } | undefined;
    abatementString?: string | undefined;
    recordedDate?: string | undefined;
    asserter?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    evidence?: {
        code?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        detail?: {
            reference: string;
            display?: string | undefined;
        }[] | undefined;
    }[] | undefined;
}, {
    code: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    };
    resourceType: "Condition";
    clinicalStatus: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    };
    verificationStatus: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    };
    id?: string | undefined;
    identifier?: {
        value: string;
        type?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        use?: "usual" | "official" | "temp" | "secondary" | "old" | undefined;
        system?: string | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }[] | undefined;
    category?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    subject?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    encounter?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    bodySite?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    note?: {
        text: string;
        authorString?: string | undefined;
        time?: string | undefined;
    }[] | undefined;
    recorder?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    severity?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    } | undefined;
    onsetDateTime?: string | undefined;
    onsetAge?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    onsetPeriod?: {
        start: string;
        end?: string | undefined;
    } | undefined;
    onsetRange?: {
        low: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        high: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    } | undefined;
    abatementDateTime?: string | undefined;
    abatementAge?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    abatementPeriod?: {
        start: string;
        end?: string | undefined;
    } | undefined;
    abatementRange?: {
        low: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        high: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    } | undefined;
    abatementString?: string | undefined;
    recordedDate?: string | undefined;
    asserter?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    evidence?: {
        code?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        detail?: {
            reference: string;
            display?: string | undefined;
        }[] | undefined;
    }[] | undefined;
}>;
export type Condition = z.infer<typeof ConditionSchema>;
export type ConditionEvidence = z.infer<typeof ConditionEvidenceSchema>;
export interface ConditionResourceConfig {
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
export declare class ConditionResourceError extends Error {
    readonly code: string;
    readonly cause?: unknown | undefined;
    constructor(code: string, message: string, cause?: unknown | undefined);
}
interface MetricsSnapshot {
    operationCount: number;
    successCount: number;
    failureCount: number;
    errorCount: number;
    lastError?: string;
    operationDistribution: Record<string, number>;
    durationHistogram: number[];
}
interface EventLog {
    id: string;
    type: string;
    timestamp: string;
    source: string;
    operation: string;
    conditionId?: string;
    patientId?: string;
    data: any;
    success: boolean;
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
export declare class ConditionResource {
    private client;
    private config;
    private metrics;
    private logger;
    private tracer;
    private circuitBreaker;
    private retryStrategy;
    private healthChecker;
    constructor(client: AtlasFhirClient, config?: Partial<ConditionResourceConfig>);
    create(condition: Condition): Promise<Condition>;
    read(id: string): Promise<Condition>;
    update(condition: Condition): Promise<Condition>;
    delete(id: string): Promise<void>;
    search(params: {
        patient?: string;
        subject?: string;
        code?: string;
        category?: string;
        clinical_status?: string;
        verification_status?: string;
        severity?: string;
        onset_date?: string;
        abatement_date?: string;
        recorded_date?: string;
        evidence_code?: string;
        _count?: number;
        _page?: number;
    }): Promise<any>;
    getActiveConditions(patientId: string): Promise<any>;
    getByIcd10Code(patientId: string, icd10Code: string): Promise<any>;
    getProblemList(patientId: string): Promise<any>;
    getHealthConcerns(patientId: string): Promise<any>;
    createCondition(params: {
        patientId: string;
        code: {
            system: string;
            code: string;
            display?: string;
        };
        clinicalStatus: 'active' | 'recurrence' | 'relapse' | 'inactive' | 'remission' | 'resolved';
        verificationStatus: 'unconfirmed' | 'provisional' | 'differential' | 'confirmed' | 'refuted' | 'entered-in-error';
        category?: string;
        severity?: {
            system: string;
            code: string;
            display?: string;
        };
        onsetDateTime?: string;
        recorderId?: string;
        note?: string;
    }): Promise<Condition>;
    getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot>;
    getEvents(): EventLog[];
    getHealth(): Promise<HealthStatus>;
    getInfo(): {
        name: string;
        version: string;
        capabilities: string[];
    };
    private retryWithTimeout;
    private recordMetrics;
}
export {};
//# sourceMappingURL=Condition.d.ts.map