import { z } from 'zod';
import { AtlasFhirClient } from '../client';
export declare const ServiceRequestSchema: z.ZodObject<{
    resourceType: z.ZodLiteral<"ServiceRequest">;
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
    instantiatesCanonical: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    instantiatesUri: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    basedOn: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
    replaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
    requisition: z.ZodOptional<z.ZodObject<{
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
    }>>;
    status: z.ZodEnum<["draft", "active", "on-hold", "revoked", "completed", "entered-in-error", "unknown"]>;
    intent: z.ZodEnum<["proposal", "plan", "order", "original-order", "reflex-order", "filler-order", "instance-order", "option"]>;
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
    priority: z.ZodOptional<z.ZodEnum<["routine", "urgent", "stat", "asap"]>>;
    doNotPerform: z.ZodOptional<z.ZodBoolean>;
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
    orderDetail: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    quantityQuantity: z.ZodOptional<z.ZodObject<{
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
    quantityRatio: z.ZodOptional<z.ZodObject<{
        numerator: z.ZodObject<{
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
        denominator: z.ZodObject<{
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
        numerator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        denominator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    }, {
        numerator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        denominator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    }>>;
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
    occurrenceDateTime: z.ZodOptional<z.ZodString>;
    occurrencePeriod: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end?: string | undefined;
    }, {
        start: string;
        end?: string | undefined;
    }>>;
    occurrenceTiming: z.ZodOptional<z.ZodObject<{
        event: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        repeat: z.ZodOptional<z.ZodObject<{
            boundsDuration: z.ZodOptional<z.ZodObject<{
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
            count: z.ZodOptional<z.ZodNumber>;
            countMax: z.ZodOptional<z.ZodNumber>;
            duration: z.ZodOptional<z.ZodNumber>;
            durationMax: z.ZodOptional<z.ZodNumber>;
            durationUnit: z.ZodOptional<z.ZodEnum<["s", "min", "h", "d", "wk", "mo", "a"]>>;
            frequency: z.ZodOptional<z.ZodNumber>;
            frequencyMax: z.ZodOptional<z.ZodNumber>;
            period: z.ZodOptional<z.ZodNumber>;
            periodMax: z.ZodOptional<z.ZodNumber>;
            periodUnit: z.ZodOptional<z.ZodEnum<["s", "min", "h", "d", "wk", "mo", "a"]>>;
            dayOfWeek: z.ZodOptional<z.ZodArray<z.ZodEnum<["mon", "tue", "wed", "thu", "fri", "sat", "sun"]>, "many">>;
            timeOfDay: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            when: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            offset: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            period?: number | undefined;
            boundsDuration?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            count?: number | undefined;
            countMax?: number | undefined;
            duration?: number | undefined;
            durationMax?: number | undefined;
            durationUnit?: "s" | "min" | "h" | "d" | "wk" | "mo" | "a" | undefined;
            frequency?: number | undefined;
            frequencyMax?: number | undefined;
            periodMax?: number | undefined;
            periodUnit?: "s" | "min" | "h" | "d" | "wk" | "mo" | "a" | undefined;
            dayOfWeek?: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[] | undefined;
            timeOfDay?: string[] | undefined;
            when?: string[] | undefined;
            offset?: number | undefined;
        }, {
            period?: number | undefined;
            boundsDuration?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            count?: number | undefined;
            countMax?: number | undefined;
            duration?: number | undefined;
            durationMax?: number | undefined;
            durationUnit?: "s" | "min" | "h" | "d" | "wk" | "mo" | "a" | undefined;
            frequency?: number | undefined;
            frequencyMax?: number | undefined;
            periodMax?: number | undefined;
            periodUnit?: "s" | "min" | "h" | "d" | "wk" | "mo" | "a" | undefined;
            dayOfWeek?: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[] | undefined;
            timeOfDay?: string[] | undefined;
            when?: string[] | undefined;
            offset?: number | undefined;
        }>>;
        code: z.ZodOptional<z.ZodObject<{
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
        }>>;
    }, "strip", z.ZodTypeAny, {
        code?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        event?: string[] | undefined;
        repeat?: {
            period?: number | undefined;
            boundsDuration?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            count?: number | undefined;
            countMax?: number | undefined;
            duration?: number | undefined;
            durationMax?: number | undefined;
            durationUnit?: "s" | "min" | "h" | "d" | "wk" | "mo" | "a" | undefined;
            frequency?: number | undefined;
            frequencyMax?: number | undefined;
            periodMax?: number | undefined;
            periodUnit?: "s" | "min" | "h" | "d" | "wk" | "mo" | "a" | undefined;
            dayOfWeek?: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[] | undefined;
            timeOfDay?: string[] | undefined;
            when?: string[] | undefined;
            offset?: number | undefined;
        } | undefined;
    }, {
        code?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        event?: string[] | undefined;
        repeat?: {
            period?: number | undefined;
            boundsDuration?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            count?: number | undefined;
            countMax?: number | undefined;
            duration?: number | undefined;
            durationMax?: number | undefined;
            durationUnit?: "s" | "min" | "h" | "d" | "wk" | "mo" | "a" | undefined;
            frequency?: number | undefined;
            frequencyMax?: number | undefined;
            periodMax?: number | undefined;
            periodUnit?: "s" | "min" | "h" | "d" | "wk" | "mo" | "a" | undefined;
            dayOfWeek?: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[] | undefined;
            timeOfDay?: string[] | undefined;
            when?: string[] | undefined;
            offset?: number | undefined;
        } | undefined;
    }>>;
    asNeededBoolean: z.ZodOptional<z.ZodBoolean>;
    asNeededCodeableConcept: z.ZodOptional<z.ZodObject<{
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
    }>>;
    authoredOn: z.ZodOptional<z.ZodString>;
    requester: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
    performerType: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    performer: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
    locationCode: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    locationReference: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
    reasonCode: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    reasonReference: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
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
    patientInstruction: z.ZodOptional<z.ZodString>;
    relevantHistory: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    code: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    };
    status: "unknown" | "draft" | "active" | "on-hold" | "revoked" | "completed" | "entered-in-error";
    resourceType: "ServiceRequest";
    intent: "proposal" | "plan" | "order" | "original-order" | "reflex-order" | "filler-order" | "instance-order" | "option";
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
    instantiatesCanonical?: string[] | undefined;
    instantiatesUri?: string[] | undefined;
    basedOn?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    replaces?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    requisition?: {
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
    } | undefined;
    category?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    priority?: "routine" | "urgent" | "stat" | "asap" | undefined;
    doNotPerform?: boolean | undefined;
    orderDetail?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    quantityQuantity?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    quantityRatio?: {
        numerator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        denominator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    } | undefined;
    subject?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    encounter?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    occurrenceDateTime?: string | undefined;
    occurrencePeriod?: {
        start: string;
        end?: string | undefined;
    } | undefined;
    occurrenceTiming?: {
        code?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        event?: string[] | undefined;
        repeat?: {
            period?: number | undefined;
            boundsDuration?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            count?: number | undefined;
            countMax?: number | undefined;
            duration?: number | undefined;
            durationMax?: number | undefined;
            durationUnit?: "s" | "min" | "h" | "d" | "wk" | "mo" | "a" | undefined;
            frequency?: number | undefined;
            frequencyMax?: number | undefined;
            periodMax?: number | undefined;
            periodUnit?: "s" | "min" | "h" | "d" | "wk" | "mo" | "a" | undefined;
            dayOfWeek?: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[] | undefined;
            timeOfDay?: string[] | undefined;
            when?: string[] | undefined;
            offset?: number | undefined;
        } | undefined;
    } | undefined;
    asNeededBoolean?: boolean | undefined;
    asNeededCodeableConcept?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    authoredOn?: string | undefined;
    requester?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    performerType?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    performer?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    locationCode?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    locationReference?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    reasonCode?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    reasonReference?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
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
    patientInstruction?: string | undefined;
    relevantHistory?: {
        reference: string;
        display?: string | undefined;
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
    status: "unknown" | "draft" | "active" | "on-hold" | "revoked" | "completed" | "entered-in-error";
    resourceType: "ServiceRequest";
    intent: "proposal" | "plan" | "order" | "original-order" | "reflex-order" | "filler-order" | "instance-order" | "option";
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
    instantiatesCanonical?: string[] | undefined;
    instantiatesUri?: string[] | undefined;
    basedOn?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    replaces?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    requisition?: {
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
    } | undefined;
    category?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    priority?: "routine" | "urgent" | "stat" | "asap" | undefined;
    doNotPerform?: boolean | undefined;
    orderDetail?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    quantityQuantity?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    quantityRatio?: {
        numerator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        denominator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    } | undefined;
    subject?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    encounter?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    occurrenceDateTime?: string | undefined;
    occurrencePeriod?: {
        start: string;
        end?: string | undefined;
    } | undefined;
    occurrenceTiming?: {
        code?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        event?: string[] | undefined;
        repeat?: {
            period?: number | undefined;
            boundsDuration?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            count?: number | undefined;
            countMax?: number | undefined;
            duration?: number | undefined;
            durationMax?: number | undefined;
            durationUnit?: "s" | "min" | "h" | "d" | "wk" | "mo" | "a" | undefined;
            frequency?: number | undefined;
            frequencyMax?: number | undefined;
            periodMax?: number | undefined;
            periodUnit?: "s" | "min" | "h" | "d" | "wk" | "mo" | "a" | undefined;
            dayOfWeek?: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[] | undefined;
            timeOfDay?: string[] | undefined;
            when?: string[] | undefined;
            offset?: number | undefined;
        } | undefined;
    } | undefined;
    asNeededBoolean?: boolean | undefined;
    asNeededCodeableConcept?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    authoredOn?: string | undefined;
    requester?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    performerType?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    performer?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    locationCode?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    locationReference?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    reasonCode?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    reasonReference?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
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
    patientInstruction?: string | undefined;
    relevantHistory?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
}>;
export type ServiceRequest = z.infer<typeof ServiceRequestSchema>;
export interface ReferralRequestResourceConfig {
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
export declare class ReferralRequestResourceError extends Error {
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
    serviceRequestId?: string;
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
export declare class ReferralRequestResource {
    private client;
    private config;
    private metrics;
    private logger;
    private tracer;
    private circuitBreaker;
    private retryStrategy;
    private healthChecker;
    constructor(client: AtlasFhirClient, config?: Partial<ReferralRequestResourceConfig>);
    create(serviceRequest: ServiceRequest): Promise<ServiceRequest>;
    read(id: string): Promise<ServiceRequest>;
    update(serviceRequest: ServiceRequest): Promise<ServiceRequest>;
    delete(id: string): Promise<void>;
    search(params: {
        patient?: string;
        subject?: string;
        code?: string;
        category?: string;
        status?: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown';
        intent?: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
        priority?: 'routine' | 'urgent' | 'stat' | 'asap';
        performer?: string;
        authoredon?: string;
        _count?: number;
        _page?: number;
    }): Promise<any>;
    getActiveReferrals(patientId: string): Promise<any>;
    createReferral(params: {
        patientId: string;
        requesterId: string;
        specialty: {
            system: string;
            code: string;
            display?: string;
        };
        urgency?: 'routine' | 'urgent' | 'stat' | 'asap';
        reasonForReferral?: string;
        clinicalIndications?: string;
        performerId?: string;
        encounterId?: string;
        notes?: string;
    }): Promise<ServiceRequest>;
    createEmergencyReferral(params: {
        patientId: string;
        requesterId: string;
        emergencyDepartmentId: string;
        reasonForVisit: string;
        clinicalIndications: string;
        priority?: 'urgent' | 'stat';
    }): Promise<ServiceRequest>;
    createSpecialistReferral(params: {
        patientId: string;
        requesterId: string;
        specialty: {
            system: string;
            code: string;
            display?: string;
        };
        specialistId?: string;
        reasonForReferral: string;
        clinicalIndications: string;
        urgency?: 'routine' | 'urgent';
    }): Promise<ServiceRequest>;
    updateStatus(referralId: string, status: ServiceRequest['status']): Promise<ServiceRequest>;
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
export declare function createReferralRequestResource(client: AtlasFhirClient, config?: Partial<ReferralRequestResourceConfig>): ReferralRequestResource;
export {};
//# sourceMappingURL=ReferralRequest.d.ts.map