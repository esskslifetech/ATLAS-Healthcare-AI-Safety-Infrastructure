import { z } from 'zod';
import { AtlasFhirClient } from '../client';
export declare const MedicationRequestDispenseRequestSchema: z.ZodObject<{
    validityPeriod: z.ZodOptional<z.ZodObject<{
        start: z.ZodOptional<z.ZodString>;
        end: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        start?: string | undefined;
        end?: string | undefined;
    }, {
        start?: string | undefined;
        end?: string | undefined;
    }>>;
    numberOfRepeatsAllowed: z.ZodOptional<z.ZodNumber>;
    quantity: z.ZodOptional<z.ZodObject<{
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
    expectedSupplyDuration: z.ZodOptional<z.ZodObject<{
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
    performer: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    performer?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    validityPeriod?: {
        start?: string | undefined;
        end?: string | undefined;
    } | undefined;
    numberOfRepeatsAllowed?: number | undefined;
    quantity?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    expectedSupplyDuration?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
}, {
    performer?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    validityPeriod?: {
        start?: string | undefined;
        end?: string | undefined;
    } | undefined;
    numberOfRepeatsAllowed?: number | undefined;
    quantity?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    expectedSupplyDuration?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
}>;
export declare const MedicationRequestSubstitutionSchema: z.ZodObject<{
    allowedBoolean: z.ZodOptional<z.ZodBoolean>;
    allowedCodeableConcept: z.ZodOptional<z.ZodObject<{
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
    reason: z.ZodOptional<z.ZodObject<{
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
    allowedBoolean?: boolean | undefined;
    allowedCodeableConcept?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    reason?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
}, {
    allowedBoolean?: boolean | undefined;
    allowedCodeableConcept?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    reason?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
}>;
export declare const MedicationRequestSchema: z.ZodObject<{
    resourceType: z.ZodLiteral<"MedicationRequest">;
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
    status: z.ZodEnum<["active", "on-hold", "cancelled", "completed", "entered-in-error", "stopped", "draft", "unknown"]>;
    statusReason: z.ZodOptional<z.ZodObject<{
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
    reportedBoolean: z.ZodOptional<z.ZodBoolean>;
    reportedReference: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
    medicationCodeableConcept: z.ZodOptional<z.ZodObject<{
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
    medicationReference: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
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
    supportingInformation: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
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
    performer: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
    performerType: z.ZodOptional<z.ZodObject<{
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
    groupIdentifier: z.ZodOptional<z.ZodObject<{
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
    courseOfTherapyType: z.ZodOptional<z.ZodObject<{
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
    dosageInstruction: z.ZodOptional<z.ZodArray<z.ZodObject<{
        sequence: z.ZodOptional<z.ZodNumber>;
        text: z.ZodOptional<z.ZodString>;
        additionalInstruction: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
        patientInstruction: z.ZodOptional<z.ZodString>;
        timing: z.ZodOptional<z.ZodObject<{
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
                boundsRange: z.ZodOptional<z.ZodObject<{
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
                boundsRange?: {
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
                boundsRange?: {
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
                boundsRange?: {
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
                boundsRange?: {
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
        site: z.ZodOptional<z.ZodObject<{
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
        route: z.ZodOptional<z.ZodObject<{
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
        method: z.ZodOptional<z.ZodObject<{
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
        doseAndRate: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodObject<{
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
            doseRange: z.ZodOptional<z.ZodObject<{
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
            doseQuantity: z.ZodOptional<z.ZodObject<{
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
            rateRatio: z.ZodOptional<z.ZodObject<{
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
            rateRange: z.ZodOptional<z.ZodObject<{
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
            rateQuantity: z.ZodOptional<z.ZodObject<{
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
        }, "strip", z.ZodTypeAny, {
            type: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
                text?: string | undefined;
            };
            doseRange?: {
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
            doseQuantity?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            rateRatio?: {
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
            rateRange?: {
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
            rateQuantity?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        }, {
            type: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
                text?: string | undefined;
            };
            doseRange?: {
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
            doseQuantity?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            rateRatio?: {
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
            rateRange?: {
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
            rateQuantity?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        }>, "many">>;
        maxDosePerPeriod: z.ZodOptional<z.ZodObject<{
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
        maxDosePerAdministration: z.ZodOptional<z.ZodObject<{
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
        maxDosePerLifetime: z.ZodOptional<z.ZodObject<{
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
    }, "strip", z.ZodTypeAny, {
        text?: string | undefined;
        asNeededBoolean?: boolean | undefined;
        asNeededCodeableConcept?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        patientInstruction?: string | undefined;
        sequence?: number | undefined;
        additionalInstruction?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        timing?: {
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
                boundsRange?: {
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
            } | undefined;
        } | undefined;
        site?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        route?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        method?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        doseAndRate?: {
            type: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
                text?: string | undefined;
            };
            doseRange?: {
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
            doseQuantity?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            rateRatio?: {
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
            rateRange?: {
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
            rateQuantity?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        }[] | undefined;
        maxDosePerPeriod?: {
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
        maxDosePerAdministration?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        maxDosePerLifetime?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
    }, {
        text?: string | undefined;
        asNeededBoolean?: boolean | undefined;
        asNeededCodeableConcept?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        patientInstruction?: string | undefined;
        sequence?: number | undefined;
        additionalInstruction?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        timing?: {
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
                boundsRange?: {
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
            } | undefined;
        } | undefined;
        site?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        route?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        method?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        doseAndRate?: {
            type: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
                text?: string | undefined;
            };
            doseRange?: {
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
            doseQuantity?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            rateRatio?: {
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
            rateRange?: {
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
            rateQuantity?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        }[] | undefined;
        maxDosePerPeriod?: {
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
        maxDosePerAdministration?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        maxDosePerLifetime?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
    }>, "many">>;
    dispenseRequest: z.ZodOptional<z.ZodObject<{
        validityPeriod: z.ZodOptional<z.ZodObject<{
            start: z.ZodOptional<z.ZodString>;
            end: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            start?: string | undefined;
            end?: string | undefined;
        }, {
            start?: string | undefined;
            end?: string | undefined;
        }>>;
        numberOfRepeatsAllowed: z.ZodOptional<z.ZodNumber>;
        quantity: z.ZodOptional<z.ZodObject<{
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
        expectedSupplyDuration: z.ZodOptional<z.ZodObject<{
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
        performer: z.ZodOptional<z.ZodObject<{
            reference: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            reference: string;
            display?: string | undefined;
        }, {
            reference: string;
            display?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        performer?: {
            reference: string;
            display?: string | undefined;
        } | undefined;
        validityPeriod?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        numberOfRepeatsAllowed?: number | undefined;
        quantity?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        expectedSupplyDuration?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
    }, {
        performer?: {
            reference: string;
            display?: string | undefined;
        } | undefined;
        validityPeriod?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        numberOfRepeatsAllowed?: number | undefined;
        quantity?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        expectedSupplyDuration?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
    }>>;
    substitution: z.ZodOptional<z.ZodObject<{
        allowedBoolean: z.ZodOptional<z.ZodBoolean>;
        allowedCodeableConcept: z.ZodOptional<z.ZodObject<{
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
        reason: z.ZodOptional<z.ZodObject<{
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
        allowedBoolean?: boolean | undefined;
        allowedCodeableConcept?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        reason?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
    }, {
        allowedBoolean?: boolean | undefined;
        allowedCodeableConcept?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        reason?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
    }>>;
    priorPrescription: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
    detectedIssue: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
    eventHistory: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    status: "unknown" | "draft" | "active" | "on-hold" | "completed" | "entered-in-error" | "cancelled" | "stopped";
    resourceType: "MedicationRequest";
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
    subject?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    encounter?: {
        reference: string;
        display?: string | undefined;
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
    } | undefined;
    performer?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
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
    statusReason?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    reportedBoolean?: boolean | undefined;
    reportedReference?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    medicationCodeableConcept?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    medicationReference?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    supportingInformation?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    recorder?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    groupIdentifier?: {
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
    courseOfTherapyType?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    dosageInstruction?: {
        text?: string | undefined;
        asNeededBoolean?: boolean | undefined;
        asNeededCodeableConcept?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        patientInstruction?: string | undefined;
        sequence?: number | undefined;
        additionalInstruction?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        timing?: {
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
                boundsRange?: {
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
            } | undefined;
        } | undefined;
        site?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        route?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        method?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        doseAndRate?: {
            type: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
                text?: string | undefined;
            };
            doseRange?: {
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
            doseQuantity?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            rateRatio?: {
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
            rateRange?: {
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
            rateQuantity?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        }[] | undefined;
        maxDosePerPeriod?: {
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
        maxDosePerAdministration?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        maxDosePerLifetime?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
    }[] | undefined;
    dispenseRequest?: {
        performer?: {
            reference: string;
            display?: string | undefined;
        } | undefined;
        validityPeriod?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        numberOfRepeatsAllowed?: number | undefined;
        quantity?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        expectedSupplyDuration?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
    } | undefined;
    substitution?: {
        allowedBoolean?: boolean | undefined;
        allowedCodeableConcept?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        reason?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
    } | undefined;
    priorPrescription?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    detectedIssue?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    eventHistory?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
}, {
    status: "unknown" | "draft" | "active" | "on-hold" | "completed" | "entered-in-error" | "cancelled" | "stopped";
    resourceType: "MedicationRequest";
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
    subject?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    encounter?: {
        reference: string;
        display?: string | undefined;
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
    } | undefined;
    performer?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
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
    statusReason?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    reportedBoolean?: boolean | undefined;
    reportedReference?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    medicationCodeableConcept?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    medicationReference?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    supportingInformation?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    recorder?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    groupIdentifier?: {
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
    courseOfTherapyType?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    dosageInstruction?: {
        text?: string | undefined;
        asNeededBoolean?: boolean | undefined;
        asNeededCodeableConcept?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        patientInstruction?: string | undefined;
        sequence?: number | undefined;
        additionalInstruction?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        timing?: {
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
                boundsRange?: {
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
            } | undefined;
        } | undefined;
        site?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        route?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        method?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        doseAndRate?: {
            type: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
                text?: string | undefined;
            };
            doseRange?: {
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
            doseQuantity?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            rateRatio?: {
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
            rateRange?: {
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
            rateQuantity?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        }[] | undefined;
        maxDosePerPeriod?: {
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
        maxDosePerAdministration?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        maxDosePerLifetime?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
    }[] | undefined;
    dispenseRequest?: {
        performer?: {
            reference: string;
            display?: string | undefined;
        } | undefined;
        validityPeriod?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        numberOfRepeatsAllowed?: number | undefined;
        quantity?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        expectedSupplyDuration?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
    } | undefined;
    substitution?: {
        allowedBoolean?: boolean | undefined;
        allowedCodeableConcept?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        reason?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
    } | undefined;
    priorPrescription?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    detectedIssue?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    eventHistory?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
}>;
export type MedicationRequest = z.infer<typeof MedicationRequestSchema>;
export type MedicationRequestDispenseRequest = z.infer<typeof MedicationRequestDispenseRequestSchema>;
export type MedicationRequestSubstitution = z.infer<typeof MedicationRequestSubstitutionSchema>;
export interface MedicationRequestResourceConfig {
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
export declare class MedicationRequestResourceError extends Error {
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
    medicationRequestId?: string;
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
export declare class MedicationRequestResource {
    private client;
    private config;
    private metrics;
    private logger;
    private tracer;
    private circuitBreaker;
    private retryStrategy;
    private healthChecker;
    constructor(client: AtlasFhirClient, config?: Partial<MedicationRequestResourceConfig>);
    create(medicationRequest: MedicationRequest): Promise<MedicationRequest>;
    read(id: string): Promise<MedicationRequest>;
    update(medicationRequest: MedicationRequest): Promise<MedicationRequest>;
    delete(id: string): Promise<void>;
    search(params: {
        patient?: string;
        subject?: string;
        medication?: string;
        status?: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown';
        intent?: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
        category?: string;
        priority?: 'routine' | 'urgent' | 'stat' | 'asap';
        authoredon?: string;
        _count?: number;
        _page?: number;
    }): Promise<any>;
    getActiveMedications(patientId: string): Promise<any>;
    getByRxNormCode(patientId: string, rxNormCode: string): Promise<any>;
    createPrescription(params: {
        patientId: string;
        medicationCode: {
            system: string;
            code: string;
            display?: string;
        };
        dosageInstruction: {
            text: string;
            doseQuantity: {
                value: number;
                unit: string;
                system?: string;
                code?: string;
            };
            frequency: string;
            route?: {
                system: string;
                code: string;
                display?: string;
            };
        };
        intent?: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
        requesterId?: string;
        authoredOn?: string;
        reasonCode?: {
            system: string;
            code: string;
            display?: string;
        };
    }): Promise<MedicationRequest>;
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
export declare function createMedicationRequestResource(client: AtlasFhirClient, config?: Partial<MedicationRequestResourceConfig>): MedicationRequestResource;
export {};
//# sourceMappingURL=MedicationRequest.d.ts.map